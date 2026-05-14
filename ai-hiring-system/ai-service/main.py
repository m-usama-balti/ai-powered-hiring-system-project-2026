# ai-service/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from pathlib import Path
import io
import os
import re
import shutil
import tempfile
import hashlib
import time
import uuid

import numpy as np

import docx2txt
from docx import Document as DocxDocument
import joblib
import nltk
import spacy
import pdfplumber
import pytesseract
import fitz  # PyMuPDF
from PIL import Image

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None

try:
    import faiss
    FAISS_AVAILABLE = True
except Exception:
    faiss = None
    FAISS_AVAILABLE = False

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ai_matching_engine import AIMatchingEngine


def _parse_origin_list(value: Optional[str]) -> List[str]:
    if not value:
        return []

    return [item.strip() for item in re.split(r"[,\s]+", value) if item.strip()]

# ---------------------------------------------------------
# 1. TESSERACT OCR CONFIGURATION
# ---------------------------------------------------------
# Explicitly point to the Tesseract executable on Windows if needed
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
TESSERACT_AVAILABLE = False
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    TESSERACT_AVAILABLE = True
    print(f"Tesseract-OCR executable found and set: {TESSERACT_PATH}")
else:
    tesseract_in_path = shutil.which('tesseract')
    if tesseract_in_path:
        TESSERACT_AVAILABLE = True
        print(f"Tesseract-OCR executable found in PATH: {tesseract_in_path}")
    else:
        print("WARNING: Tesseract-OCR not found. OCR will fail until Tesseract is installed or added to PATH.")

# ---------------------------------------------------------
# 2. INITIALIZATION & MODEL LOADING
# ---------------------------------------------------------

# --- Logger Configuration ---
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
JSON_LOGS = os.getenv("JSON_LOGS", "false").lower() == "true"

logger.remove()
if JSON_LOGS:
    logger.add(
        "logs/ai_service.log",
        level=LOG_LEVEL,
        format="{message}",
        serialize=True,
        rotation="10 MB",
        compression="zip",
    )
else:
    logger.add(
        "logs/ai_service.log",
        level=LOG_LEVEL,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        colorize=True,
        rotation="10 MB",
        compression="zip",
    )
logger.add(lambda msg: print(msg, end=""), colorize=True,
           format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>")

# --- Rate Limiter Configuration ---
limiter = Limiter(key_func=get_remote_address,
                  default_limits=["100 per minute"])

app = FastAPI(title="AI Hiring System Engine", version="2.1")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

ENV_CORS_ORIGINS = (
    _parse_origin_list(os.getenv("CORS_ORIGINS"))
    + _parse_origin_list(os.getenv("FRONTEND_URL"))
    + _parse_origin_list(os.getenv("CLIENT_URL"))
)

ALLOW_ORIGIN_REGEX = r"https://.*\.vercel\.app"

_advanced_matching_engine = None


@app.on_event("startup")
async def initialize_advanced_matching_engine():
    """Load the FAISS + SentenceTransformer engine once when the server starts."""
    global _advanced_matching_engine
    if _advanced_matching_engine is not None:
        return
    try:
        _advanced_matching_engine = AIMatchingEngine(BASE_DIR)
        app.state.advanced_matching_engine = _advanced_matching_engine
        logger.info("Advanced AIMatchingEngine initialized successfully")
    except Exception as exc:
        _advanced_matching_engine = None
        app.state.advanced_matching_engine = None
        logger.exception(f"Failed to initialize AIMatchingEngine: {exc}")


def get_advanced_matching_engine():
    return getattr(app.state, "advanced_matching_engine", None) or _advanced_matching_engine

# --- Request ID and Logging Middleware ---


@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid.uuid4())
    with logger.contextualize(request_id=request_id):
        logger.info(f"Request: {request.method} {request.url.path}")
        start_time = time.time()

        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(
                f"Response: {response.status_code} in {process_time:.2f}ms")
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.exception(
                f"Unhandled exception for {request.method} {request.url.path} "
                f"after {process_time:.2f}ms"
            )
            return HTTPException(status_code=500, detail="Internal Server Error")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[*dict.fromkeys(DEFAULT_CORS_ORIGINS + ENV_CORS_ORIGINS)],
    allow_origin_regex=ALLOW_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy for Resume Parsing
try:
    nlp = spacy.load("en_core_web_sm")
    print("spaCy model 'en_core_web_sm' loaded successfully.")
except OSError:
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    print("!! WARNING: spaCy model 'en_core_web_sm' not found.             !!")
    print("!! To fix, run this command in your terminal:                   !!")
    print("!! python -m spacy download en_core_web_sm                      !!")
    print("!! The '/parse-resume' endpoint will be disabled until fixed.   !!")
    print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    nlp = None


def _download_nltk_resources():
    resources = ["punkt", "averaged_perceptron_tagger",
                 "maxent_ne_chunker", "words", "stopwords"]
    for resource in resources:
        try:
            if resource in ["punkt", "stopwords", "words"]:
                nltk.data.find(f"tokenizers/{resource}")
            elif resource == "averaged_perceptron_tagger":
                nltk.data.find(f"taggers/{resource}")
            elif resource == "maxent_ne_chunker":
                nltk.data.find(f"chunkers/{resource}")
        except LookupError:
            print(f"Downloading NLTK resource: {resource}")
            nltk.download(resource)


_download_nltk_resources()

# Load the Advanced Scikit-Learn Models
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "advanced_tfidf_vectorizer.pkl"
try:
    global_vectorizer = joblib.load(MODEL_PATH)
    print(f"Successfully loaded Pre-Trained AI Model: {MODEL_PATH}")
except FileNotFoundError:
    print(
        f"WARNING: {MODEL_PATH} not found. AI will fallback to basic on-the-fly math.")
    global_vectorizer = None

SPAM_MODEL_PATH = BASE_DIR / "spam_model.pkl"
try:
    spam_model = joblib.load(SPAM_MODEL_PATH)
    print(f"Successfully loaded Spam Detection Model: {SPAM_MODEL_PATH}")
except FileNotFoundError:
    print(
        f"WARNING: {SPAM_MODEL_PATH} not found. /scan-spam will be unavailable.")
    spam_model = None

SENTENCE_MODEL_NAME = os.getenv("SENTENCE_MODEL_NAME", "all-MiniLM-L6-v2")
_sentence_model = None
_sentence_model_error = None


def get_sentence_model():
    global _sentence_model, _sentence_model_error
    if _sentence_model is not None or _sentence_model_error is not None:
        return _sentence_model
    if SentenceTransformer is None:
        _sentence_model_error = "sentence-transformers not installed"
        print(
            "WARNING: sentence-transformers not installed. Embedding similarity disabled.")
        return None
    try:
        _sentence_model = SentenceTransformer(SENTENCE_MODEL_NAME)
        print(f"SentenceTransformer model loaded: {SENTENCE_MODEL_NAME}")
    except Exception as exc:
        _sentence_model_error = str(exc)
        print(f"WARNING: Failed to load sentence-transformers model: {exc}")
        _sentence_model = None
    return _sentence_model


# Canonical tech terms
TECH_DICTIONARY = {
    "react", "reactjs", "next.js", "tailwind", "html5", "css3", "html", "css",
    "javascript", "typescript", "node.js", "express.js", "express", "mysql", "mongodb",
    "restful apis", "rest api", "docker", "kubernetes", "git", "github", "linux", "nginx",
    "aws", "python", "ci/cd", "devops", "fastapi", "django", "scikit-learn",
    "pandas", "numpy", "machine learning", "nlp", "azure", "gcp", "sql", "java", "c++", "c#"
}

SKILL_ALIASES = {
    "reactjs": "react", "react.js": "react", "react js": "react",
    "node": "node.js", "nodejs": "node.js", "node js": "node.js",
    "expressjs": "express.js", "express js": "express.js",
    "restful api": "restful apis", "rest api": "restful apis",
    "machine-learning": "machine learning", "ml": "machine learning",
    "html": "html5", "css": "css3", "github actions": "ci/cd", "cicd": "ci/cd"
}

SKILL_DISPLAY_NAMES = {
    "react": "React", "next.js": "Next.js", "tailwind": "Tailwind", "html5": "HTML5",
    "css3": "CSS3", "javascript": "JavaScript", "typescript": "TypeScript",
    "node.js": "Node.js", "express.js": "Express.js", "mysql": "MySQL",
    "mongodb": "MongoDB", "restful apis": "RESTful APIs", "docker": "Docker",
    "kubernetes": "Kubernetes", "git": "Git", "github": "GitHub", "linux": "Linux",
    "aws": "AWS", "python": "Python", "ci/cd": "CI/CD", "devops": "DevOps",
    "fastapi": "FastAPI", "django": "Django", "scikit-learn": "Scikit-learn",
    "pandas": "Pandas", "numpy": "NumPy", "machine learning": "Machine Learning",
    "nlp": "NLP", "sql": "SQL", "java": "Java", "c++": "C++", "c#": "C#"
}


def normalize_text(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\./-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def canonical_skill(term: str) -> str:
    normalized = normalize_text(term)
    return SKILL_ALIASES.get(normalized, normalized)


def format_skill(term: str) -> str:
    return SKILL_DISPLAY_NAMES.get(term, term.title())


SECTION_HEADERS = {
    "summary", "profile", "experience", "work experience", "employment",
    "education", "skills", "projects", "certifications", "licenses",
    "languages", "interests", "activities"
}

JOB_TITLE_KEYWORDS = [
    "engineer", "developer", "manager", "analyst", "designer",
    "scientist", "architect", "consultant", "lead", "director",
    "intern", "specialist", "administrator", "associate"
]

LANGUAGE_KEYWORDS = {
    "english", "spanish", "french", "german", "arabic", "urdu", "hindi",
    "chinese", "mandarin", "japanese", "korean", "italian", "portuguese",
    "russian", "dutch", "swedish", "norwegian", "danish", "polish"
}

CERT_KEYWORDS = {
    "certified", "certification", "certificate", "aws", "azure", "gcp",
    "pmp", "cissp", "ccna", "ceh", "scrum", "itil", "oracle"
}


def _normalize_url(url: str) -> str:
    cleaned = url.strip().rstrip(").,;:")
    if cleaned.startswith("www."):
        return f"https://{cleaned}"
    return cleaned


def extract_urls(text: str) -> List[str]:
    matches = re.findall(
        r"(https?://[^\s]+|www\.[^\s]+)", text, flags=re.IGNORECASE)
    urls = [_normalize_url(url) for url in matches]
    unique = []
    for url in urls:
        if url not in unique:
            unique.append(url)
    return unique


def extract_links(text: str) -> Dict[str, Optional[str] | List[str]]:
    urls = extract_urls(text)
    linkedin = next(
        (url for url in urls if "linkedin.com" in url.lower()), None)
    github = next((url for url in urls if "github.com" in url.lower()), None)
    portfolio = [url for url in urls if url not in {linkedin, github}]
    return {
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio
    }


def extract_section(text: str, headings: List[str]) -> str:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    lower_lines = [line.lower() for line in lines]
    for idx, line in enumerate(lower_lines):
        if any(heading in line for heading in headings):
            collected = []
            for next_line in lines[idx + 1:]:
                next_lower = next_line.lower()
                if any(header in next_lower for header in SECTION_HEADERS):
                    break
                collected.append(next_line)
                if len(collected) >= 6:
                    break
            return " ".join(collected).strip()
    return ""


def extract_languages(text: str) -> List[str]:
    section = extract_section(text, ["languages", "language"])
    candidates = []
    if section:
        candidates = re.split(r"[,;/\|•]+", section)
    words = set(word.strip().lower() for word in candidates if word.strip())
    if not words:
        words = set(re.findall(r"\b[A-Za-z]+\b", text.lower()))
    languages = sorted({lang.title()
                       for lang in words if lang in LANGUAGE_KEYWORDS})
    return languages


def extract_certifications(text: str) -> List[str]:
    section = extract_section(
        text, ["certifications", "licenses", "certificates"])
    candidates = []
    if section:
        candidates = re.split(r"[,;/\|•]+", section)
    certs = []
    for item in candidates:
        cleaned = item.strip()
        if cleaned:
            certs.append(cleaned)
    if not certs:
        tokens = re.split(r"\s+", text)
        if any(token.lower() in CERT_KEYWORDS for token in tokens):
            certs.append("Certifications mentioned")
    return sorted(set(certs))


def extract_experience_section(text: str) -> str:
    return extract_section(text, ["experience", "work experience", "employment"])


def extract_total_experience_years(text: str) -> int:
    matches = re.findall(
        r"(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years|yrs)\b", text, flags=re.IGNORECASE)
    values = [float(value) for value in matches]
    if not values:
        return 0
    return int(max(values))


def extract_job_titles(text: str) -> List[str]:
    pattern = r"\b([A-Z][A-Za-z&/.-]+(?:\s+[A-Z][A-Za-z&/.-]+){0,3}\s+(?:" + "|".join(
        JOB_TITLE_KEYWORDS) + "))\b"
    titles = re.findall(pattern, text, flags=re.IGNORECASE)
    cleaned = []
    for title in titles:
        normalized = " ".join(word.capitalize() for word in title.split())
        if normalized not in cleaned:
            cleaned.append(normalized)
    return cleaned


def extract_companies(doc, text: str) -> List[str]:
    companies = set()
    if doc is not None:
        for ent in doc.ents:
            if ent.label_ == "ORG" and len(ent.text.strip()) > 2:
                companies.add(ent.text.strip())
    suffix_pattern = r"\b([A-Z][A-Za-z0-9&\s.-]+\s+(?:Inc|LLC|Ltd|Corporation|Corp|Company|Co)\.)\b"
    for match in re.findall(suffix_pattern, text):
        companies.add(match.strip())
    return sorted(companies)


def extract_address(text: str, doc) -> str:
    address_pattern = r"\b\d{1,5}\s+[A-Za-z0-9\s.-]+\s(?:Street|St|Road|Rd|Avenue|Ave|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b[^\n]*"
    match = re.search(address_pattern, text, flags=re.IGNORECASE)
    if match:
        return match.group(0).strip()
    if doc is not None:
        locations = [ent.text.strip()
                     for ent in doc.ents if ent.label_ in {"GPE", "LOC"}]
        if locations:
            return ", ".join(dict.fromkeys(locations[:2]))
    return ""


def normalize_skill_list(skills: List[str]) -> List[str]:
    normalized = []
    for skill in skills:
        canonical = canonical_skill(skill)
        display = format_skill(canonical)
        if display not in normalized:
            normalized.append(display)
    return normalized


def compute_embedding_similarity(text_a: str, text_b: str) -> Optional[float]:
    model = get_sentence_model()
    if model is None:
        return None
    embeddings = model.encode([text_a, text_b])
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return max(0.0, min(1.0, float(similarity)))


def compute_skill_score(candidate_skills: List[str], job_skills: List[str], candidate_text: str, job_text: str) -> float:
    job_set = {canonical_skill(skill) for skill in job_skills}
    candidate_set = {canonical_skill(skill) for skill in candidate_skills}
    overlap_score = 50.0
    if job_set:
        overlap_score = (len(job_set & candidate_set) /
                         max(len(job_set), 1)) * 100

    tfidf_score = 50.0
    try:
        if global_vectorizer:
            vectors = global_vectorizer.transform([job_text, candidate_text])
            tfidf_score = cosine_similarity(
                vectors[0:1], vectors[1:2])[0][0] * 100
        else:
            fallback_vec = TfidfVectorizer()
            tfidf_matrix = fallback_vec.fit_transform(
                [job_text, candidate_text])
            tfidf_score = cosine_similarity(
                tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100
    except Exception as exc:
        print(f"TF-IDF similarity failed: {exc}")

    embedding_score = compute_embedding_similarity(job_text, candidate_text)
    if embedding_score is None:
        return (tfidf_score * 0.7) + (overlap_score * 0.3)

    return (tfidf_score * 0.5) + (embedding_score * 100 * 0.3) + (overlap_score * 0.2)


def compute_education_score(candidate_education: Optional[str], job_education: Optional[str]) -> float:
    if not job_education:
        return 50.0
    if not candidate_education:
        return 30.0

    def level(text: str) -> int:
        text = text.lower()
        if "phd" in text or "doctor" in text:
            return 4
        if "master" in text or "m.s" in text or "m.sc" in text:
            return 3
        if "bachelor" in text or "b.s" in text or "b.sc" in text:
            return 2
        if "associate" in text:
            return 1
        return 0

    job_level = level(job_education)
    candidate_level = level(candidate_education)

    if job_level == 0:
        return 50.0
    if candidate_level == 0:
        return 30.0
    if candidate_level >= job_level:
        return 100.0
    if candidate_level == job_level - 1:
        return 60.0
    return 30.0


def compute_preferences_score(candidate_preferences: Dict[str, Optional[str]], job_preferences: Dict[str, Optional[str]]) -> float:
    if not candidate_preferences or not job_preferences:
        return 50.0

    score = 0.0
    checks = 0
    candidate_location = (candidate_preferences.get(
        "desired_location") or "").lower()
    job_location = (job_preferences.get("location") or "").lower()
    if candidate_location and job_location:
        checks += 1
        score += 100.0 if candidate_location in job_location or job_location in candidate_location else 0.0

    candidate_job_type = (candidate_preferences.get("job_type") or "").lower()
    job_type = (job_preferences.get("job_type") or "").lower()
    if candidate_job_type and job_type:
        checks += 1
        score += 100.0 if candidate_job_type == job_type else 0.0

    if checks == 0:
        return 50.0
    return score / checks


def build_match_reasons(skill_score: float, exp_score: float, edu_score: float, pref_score: float, missing_skills: List[str]) -> List[str]:
    reasons = []
    if skill_score >= 75:
        reasons.append("Strong skill overlap with job requirements.")
    elif missing_skills:
        reasons.append("Some required skills are missing from the resume.")

    if exp_score >= 80:
        reasons.append(
            "Experience level meets or exceeds the role requirements.")
    elif exp_score < 50:
        reasons.append("Experience level is below the target for this role.")

    if edu_score >= 80:
        reasons.append(
            "Education credentials align with the role expectations.")
    if pref_score >= 80:
        reasons.append("Preferences align well with the job details.")
    return reasons


def build_recommendations(missing_skills: List[str], exp_score: float, edu_score: float) -> List[str]:
    recommendations = []
    if missing_skills:
        recommendations.append(
            f"Add or highlight these skills: {', '.join(missing_skills[:8])}.")
    if exp_score < 70:
        recommendations.append(
            "Highlight more relevant experience or quantifiable achievements.")
    if edu_score < 50:
        recommendations.append(
            "Add education details or certifications to strengthen alignment.")
    return recommendations


def embed_text(text: str) -> np.ndarray:
    model = get_sentence_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Embedding model unavailable. Install sentence-transformers to enable vector search."
        )
    embedding = model.encode([text])[0]
    return np.array(embedding, dtype="float32")


def normalize_vector(vector: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vector)
    if norm == 0:
        return vector
    return vector / norm


def id_to_int64(value: str) -> int:
    digest = hashlib.sha1(value.encode("utf-8")).digest()[:8]
    return int.from_bytes(digest, "big", signed=False)


class VectorStore:
    def __init__(self, dimension: int):
        if not FAISS_AVAILABLE:
            raise RuntimeError("FAISS is not installed")
        self.dimension = dimension
        self.index = faiss.IndexIDMap2(faiss.IndexFlatIP(dimension))
        self.id_to_int = {}
        self.int_to_id = {}
        self.metadata = {}
        self.vectors = {}

    def upsert(self, item_id: str, vector: np.ndarray, metadata: Dict[str, Optional[str] | List[str] | Dict]):
        vector = normalize_vector(vector).astype("float32")
        if vector.shape[0] != self.dimension:
            raise ValueError("Embedding dimension mismatch")

        if item_id in self.id_to_int:
            existing_int = self.id_to_int[item_id]
            self.index.remove_ids(np.array([existing_int], dtype="int64"))

        item_int = id_to_int64(item_id)
        self.id_to_int[item_id] = item_int
        self.int_to_id[item_int] = item_id
        self.metadata[item_id] = metadata
        self.vectors[item_id] = vector
        self.index.add_with_ids(vector.reshape(
            1, -1), np.array([item_int], dtype="int64"))

    def remove(self, item_id: str) -> None:
        if item_id not in self.id_to_int:
            return
        item_int = self.id_to_int.pop(item_id)
        self.index.remove_ids(np.array([item_int], dtype="int64"))
        self.int_to_id.pop(item_int, None)
        self.metadata.pop(item_id, None)
        self.vectors.pop(item_id, None)

    def get_vector(self, item_id: str) -> Optional[np.ndarray]:
        return self.vectors.get(item_id)

    def search(self, vector: np.ndarray, top_k: int, eligible_ids: Optional[List[str]] = None):
        if self.index.ntotal == 0:
            return []

        vector = normalize_vector(vector).astype("float32").reshape(1, -1)
        search_k = min(max(top_k * 3, top_k), int(self.index.ntotal))
        scores, ids = self.index.search(vector, search_k)
        results = []
        for score, idx in zip(scores[0], ids[0]):
            if idx == -1:
                continue
            item_id = self.int_to_id.get(int(idx))
            if not item_id:
                continue
            if eligible_ids and item_id not in eligible_ids:
                continue
            results.append({"id": item_id, "score": float(score)})
            if len(results) >= top_k:
                break
        return results


_job_store = None
_resume_store = None


def get_job_store():
    global _job_store
    if _job_store is None:
        if not FAISS_AVAILABLE:
            raise HTTPException(
                status_code=503, detail="FAISS not installed. Vector search unavailable.")
        model = get_sentence_model()
        if model is None:
            raise HTTPException(
                status_code=503, detail="Embedding model unavailable.")
        _job_store = VectorStore(model.get_sentence_embedding_dimension())
    return _job_store


def get_resume_store():
    global _resume_store
    if _resume_store is None:
        if not FAISS_AVAILABLE:
            raise HTTPException(
                status_code=503, detail="FAISS not installed. Vector search unavailable.")
        model = get_sentence_model()
        if model is None:
            raise HTTPException(
                status_code=503, detail="Embedding model unavailable.")
        _resume_store = VectorStore(model.get_sentence_embedding_dimension())
    return _resume_store


def build_job_text(payload: Dict[str, Optional[str] | List[str]]) -> str:
    parts = [
        payload.get("job_title") or "",
        payload.get("description") or "",
        " ".join(payload.get("skills") or []),
        payload.get("location") or "",
        payload.get("education_level") or "",
        str(payload.get("experience_years") or "")
    ]
    return " ".join(part for part in parts if part).strip()


def build_resume_text(payload: Dict[str, Optional[str] | List[str] | Dict]) -> str:
    parts = [
        " ".join(payload.get("skills") or []),
        payload.get("education") or "",
        payload.get("experience") or "",
        " ".join(payload.get("job_titles") or []),
        " ".join(payload.get("companies") or []),
        " ".join(payload.get("certifications") or []),
        " ".join(payload.get("languages") or []),
        payload.get("address") or ""
    ]
    return " ".join(part for part in parts if part).strip()


def extract_image_text(content: bytes) -> str:
    """Extracts text from image bytes using OCR."""
    if not TESSERACT_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="OCR unavailable. Tesseract-OCR is not installed or not on PATH."
        )
    try:
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image)
        if not text.strip():
            raise HTTPException(
                status_code=400, detail="OCR failed. Image may not contain readable text.")
        print("Text extracted successfully from image using OCR.")
        return text
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process image with OCR: {e}")


def extract_pdf_text(content: bytes) -> str:
    """Extracts text from a PDF, trying pdfplumber first, then falling back to OCR with PyMuPDF."""
    text = ""
    # Attempt 1: pdfplumber (preferred for text-based PDFs)
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text = " ".join(page.extract_text()
                            or "" for page in pdf.pages).strip()
        if text:
            print("PDF text extracted successfully using pdfplumber.")
            return text
    except Exception as e:
        print(f"pdfplumber failed: {e}. Proceeding to OCR fallback.")

    # Attempt 2: OCR Fallback for image-based PDFs using PyMuPDF + Tesseract
    if not TESSERACT_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="OCR unavailable. Tesseract-OCR is not installed or not on PATH."
        )
    print("Falling back to OCR for PDF processing...")
    try:
        doc = fitz.open(stream=content, filetype="pdf")
        ocr_text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            # Higher DPI for better OCR accuracy
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            ocr_text += pytesseract.image_to_string(img) + "\n"
        doc.close()
        if ocr_text.strip():
            print("PDF text extracted successfully using OCR fallback.")
            return ocr_text
        else:
            raise HTTPException(
                status_code=400, detail="OCR fallback failed. PDF contains no readable text.")
    except Exception as ocr_error:
        raise HTTPException(
            status_code=500, detail=f"PDF OCR extraction failed: {ocr_error}")


def extract_docx_text(content: bytes) -> str:
    """Extracts text from a DOCX file, trying docx2txt first, then python-docx."""
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name
        text = docx2txt.process(temp_path) or ""
        if text.strip():
            print("DOCX text extracted successfully using docx2txt.")
            return text.strip()
    except Exception as e:
        print(f"docx2txt failed: {e}. Trying python-docx.")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass

    # Attempt 2: python-docx (more robust for complex files)
    try:
        doc = DocxDocument(io.BytesIO(content))
        text = "\n".join([para.text for para in doc.paragraphs])
        if text.strip():
            print("DOCX text extracted successfully using python-docx.")
            return text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to read DOCX file with all methods: {e}")

    raise HTTPException(
        status_code=400, detail="Could not extract any text from the DOCX file.")


def extract_resume_text(file: UploadFile, content: bytes) -> str:
    """Master function to delegate text extraction based on file type."""
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(content)
    elif filename.endswith(".docx"):
        return extract_docx_text(content)
    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_image_text(content)

    raise HTTPException(
        status_code=400,
        detail="Unsupported file format. Please upload a .pdf, .docx, .png, .jpg, or .jpeg file."
    )

# ---------------------------------------------------------
# 4. NLP EXTRACTION & ANALYSIS
# ---------------------------------------------------------


def extract_name(text: str) -> str | None:
    name_match = re.search(
        r"^([A-Z][a-z]+(?:-[A-Z][a-z]+)?\s){1,2}[A-Z][a-z]+", text)
    if name_match:
        return name_match.group(0).strip()
    try:
        for sent in nltk.sent_tokenize(text):
            for chunk in nltk.ne_chunk(nltk.pos_tag(nltk.word_tokenize(sent))):
                if hasattr(chunk, "label") and chunk.label() == "PERSON":
                    return " ".join(part[0] for part in chunk.leaves())
    except Exception as e:
        print(f"NLTK name extraction failed: {e}")

    if nlp:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                return ent.text.strip()
    return None


def extract_email(text: str) -> str | None:
    emails = re.findall(
        r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+", text, flags=re.IGNORECASE)
    return emails[0] if emails else None


def extract_phone(text: str) -> str | None:
    phone_regex = re.compile(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]')
    matches = re.findall(phone_regex, text)
    if matches:
        number = ''.join(matches[0])
        if text.find(number) >= 0 and len(number) < 16:
            return number
    return None


# def extract_skills(text: str) -> List[str]:
#     stop_words = set(nltk.corpus.stopwords.words('english'))
#     word_tokens = nltk.tokenize.word_tokenize(text)
#     filtered_tokens = [word for word in word_tokens if word.isalpha(
#     ) and word.lower() not in stop_words]
#     bigrams_trigrams = list(
#         map(' '.join, nltk.everygrams(filtered_tokens, 2, 3)))

#     skills_db = {
#         'andriod developer', 'app developer', 'javascript', 'java', 'machine learning',
#         'data science', 'python', 'css', 'doctor', 'teacher', 'web development',
#         'communication', 'team work',
#     }

#     found_skills = set()
#     for token in filtered_tokens:
#         if token.lower() in skills_db:
#             found_skills.add(token.lower())
#     for ngram in bigrams_trigrams:
#         if ngram.lower() in skills_db:
#             found_skills.add(ngram.lower())
#     return sorted(found_skills)


# def extract_education(text: str) -> List[str]:
#     reserved_words = ["school", "college", "university",
#                       "academy", "faculty", "degree", "institute"]
#     education = set()
#     for sent in nltk.sent_tokenize(text):
#         if any(word in sent.lower() for word in reserved_words):
#             education.add(sent.strip())
#     degree_patterns = [
#         r"\b(?:b\.?s\.?|m\.?s\.?|ph\.?d\.?|bachelor(?:'s)?|master(?:'s)?|associate(?:'s)?)\b[^.\n]*",
#         r"\b(?:computer science|software engineering|information technology|data science|electronics|business administration)\b[^.\n]*",
#     ]
#     for pattern in degree_patterns:
#         for match in re.findall(pattern, text, flags=re.IGNORECASE):
#             if match.strip():
#                 education.add(match.strip())
#     return sorted(education)


def extract_skills(text: str) -> List[str]:
    """
    Cross-Industry Skill Extractor.
    Uses NLP grammatical rules to find skills dynamically (e.g., "Inventory Management", "Food Safety")
    instead of relying on a hardcoded dictionary.
    """
    stop_words = set(nltk.corpus.stopwords.words('english'))
    word_tokens = nltk.tokenize.word_tokenize(text)
    pos_tags = nltk.pos_tag(word_tokens)

    found_skills = set()

    # Define a grammar rule to catch professional skills:
    # <JJ>? = Optional Adjective (e.g., "Strategic", "Quality")
    # <NN.*>+ = One or more Nouns (e.g., "Planning", "Control", "Management", "Chef")
    grammar = "SKILL: {<JJ>?<NN.*>+}"
    cp = nltk.RegexpParser(grammar)
    tree = cp.parse(pos_tags)

    # Extract the phrases matching our grammar
    for subtree in tree.subtrees(filter=lambda t: t.label() == 'SKILL'):
        # Rebuild the phrase, ignoring stop words
        skill = " ".join([word for word, pos in subtree.leaves() if word.lower() not in stop_words and word.isalpha()])
        
        # Filter out junk (too short, too long, or common resume filler words)
        ignore_words = {'summary', 'experience', 'education', 'profile', 'resume', 'skills', 'work'}
        if len(skill) > 3 and len(skill.split()) <= 3 and skill.lower() not in ignore_words:
            found_skills.add(skill.title())

    # Optional: You can still keep a small dictionary for very specific single-word acronyms (like APIs, CPR, OSHA)
    specific_acronyms = {'api', 'cpr', 'osha', 'iso', 'erp', 'crm', 'seo'}
    for word in word_tokens:
        if word.lower() in specific_acronyms:
            found_skills.add(word.upper())

    return sorted(list(found_skills))

def extract_education(text: str) -> List[str]:
    """
    Cross-Industry Education Extractor.
    Catches university degrees, but also catches Diplomas, Vocational Training, 
    and Certifications highly common in Factories, Logistics, and Hospitality.
    """
    # Expanded to include vocational and certification institutes
    reserved_words = [
        "school", "college", "university", "academy", "faculty", "degree", 
        "institute", "polytechnic", "vocational", "culinary", "training center"
    ]
    
    education = set()
    
    # 1. Catch full sentences mentioning an institute (Filtered by length to avoid grabbing paragraphs)
    for sent in nltk.sent_tokenize(text):
        if any(word in sent.lower() for word in reserved_words):
            # Only add if it's a concise sentence/bullet point (less than 20 words)
            if len(sent.split()) < 20:
                education.add(sent.strip())

    # 2. Expanded Regex Patterns for ALL Industries
    degree_patterns = [
        # Catch traditional degrees
        r"\b(?:b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?|bachelor(?:'s)?|master(?:'s)?|associate(?:'s)?|doctorate)\b[^.\n,]*",
        # Catch industry certifications and diplomas (crucial for hospitality/factories)
        r"\b(?:diploma|certification|certificate|license|certified)\b[^.\n,]*",
        # Catch broad fields of study across multiple industries
        r"\b(?:computer science|engineering|information technology|business administration|supply chain|logistics|hospitality|culinary arts|manufacturing|human resources|finance|safety management)\b[^.\n,]*",
    ]
    
    for pattern in degree_patterns:
        for match in re.findall(pattern, text, flags=re.IGNORECASE):
            cleaned_match = match.strip()
            # Filter out tiny strings or massive run-on sentences
            if len(cleaned_match) > 4 and len(cleaned_match.split()) <= 8:
                education.add(cleaned_match.title())

    return sorted(list(education))
class MatchRequest(BaseModel):
    candidate_skills: List[str] = []
    job_skills: List[str] = []
    candidate_experience: int = 0
    job_experience: int = 0
    candidate_education: Optional[str] = None
    job_education: Optional[str] = None
    candidate_preferences: Dict[str, Optional[str]
                                ] = Field(default_factory=dict)
    job_preferences: Dict[str, Optional[str]] = Field(default_factory=dict)
    candidate_text: Optional[str] = None
    job_text: Optional[str] = None


class SpamScanRequest(BaseModel):
    job_description: str


class VectorJobUpsertRequest(BaseModel):
    job_id: str
    job_title: str
    description: str
    skills: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    education_level: Optional[str] = None
    experience_years: Optional[int] = None


class VectorResumeUpsertRequest(BaseModel):
    candidate_id: str
    skills: List[str] = Field(default_factory=list)
    education: Optional[str] = None
    experience: Optional[str] = None
    total_experience_years: Optional[int] = None
    job_titles: List[str] = Field(default_factory=list)
    companies: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    address: Optional[str] = None
    preferences: Dict[str, Optional[str]] = Field(default_factory=dict)


class VectorSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    eligible_ids: List[str] = Field(default_factory=list)


class RecommendationRequest(BaseModel):
    candidate_id: str
    top_k: int = 5
    eligible_job_ids: List[str] = Field(default_factory=list)


@app.get("/")
@limiter.limit("30/minute")
def read_root(request: Request):
    return {"status": "Advanced AI Engine Online", "version": "2.1"}


@app.get("/health")
@limiter.limit("30/minute")
def health_check(request: Request):
    return {
        "status": "ok",
        "version": "2.1",
        "nlp_loaded": nlp is not None,
        "tesseract_available": TESSERACT_AVAILABLE,
        "faiss_available": FAISS_AVAILABLE,
        "sentence_transformer_loaded": _sentence_model is not None,
        "sentence_transformer_error": _sentence_model_error,
        "job_index_size": int(_job_store.index.ntotal) if _job_store else 0,
        "resume_index_size": int(_resume_store.index.ntotal) if _resume_store else 0
    }


@app.post("/parse")
@app.post("/parse-resume")
@limiter.limit("10/minute")
async def parse_resume(request: Request, file: UploadFile = File(...)):
    """
    Receives an uploaded resume file, extracts text based on its type,
    and returns structured data (skills, name, etc.).
    Supports: PDF, DOCX, PNG, JPG, JPEG
    """
    if not nlp:
        logger.error("NLP model not loaded, cannot parse resume.")
        raise HTTPException(
            status_code=503, detail="Server-side NLP model is not loaded.")
    if not file.filename:
        logger.warn("Parse request rejected: file has no filename.")
        raise HTTPException(status_code=400, detail="File must be provided.")

    content = await file.read()
    if not content:
        logger.warn(
            f"Parse request rejected: file '{file.filename}' is empty.")
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        logger.info(f"Starting resume parsing for file: {file.filename}")
        # Delegate to the master extraction function
        raw_text = extract_resume_text(file, content)

        # --- NLP Processing ---
        clean_text = normalize_text(raw_text)
        doc = nlp(raw_text)

        skill_canon = {canonical_skill(skill)
                       for skill in extract_skills(raw_text)}
        for token in doc:
            normalized = canonical_skill(token.text)
            if normalized in TECH_DICTIONARY:
                skill_canon.add(normalized)

        for chunk in doc.noun_chunks:
            normalized = canonical_skill(chunk.text)
            if normalized in TECH_DICTIONARY:
                skill_canon.add(normalized)

        for tech in TECH_DICTIONARY:
            if tech in clean_text:
                skill_canon.add(tech)

        normalized_skills = [format_skill(skill)
                             for skill in sorted(skill_canon)]
        links = extract_links(raw_text)

        profile = {
            "name": extract_name(raw_text),
            "email": extract_email(raw_text),
            "phone": extract_phone(raw_text),
            "skills": normalized_skills,
            "education": extract_education(raw_text),
            "experience": extract_experience_section(raw_text),
            "certifications": extract_certifications(raw_text),
            "languages": extract_languages(raw_text),
            "linkedin": links.get("linkedin"),
            "github": links.get("github"),
            "portfolio_links": links.get("portfolio", []),
            "address": extract_address(raw_text, doc),
            "total_experience_years": extract_total_experience_years(raw_text),
            "job_titles": extract_job_titles(raw_text),
            "companies": extract_companies(doc, raw_text)
        }

        logger.success(f"Successfully parsed resume: {file.filename}")
        return {
            "user_profile": profile,
            "extracted_data": profile,
            "filename": file.filename,
            "message": "Resume parsed successfully."
        }
    except HTTPException as e:
        logger.warning(
            f"HTTP exception during parsing of {file.filename}: {e.detail}")
        # Re-raise HTTP exceptions from helpers
        raise e
    except Exception as e:
        # Catch any other unexpected errors
        logger.exception(f"UNEXPECTED PARSING ERROR for file {file.filename}")
        raise HTTPException(
            status_code=500, detail=f"An unexpected server error occurred: {e}")


@app.post("/match")
@limiter.limit("60/minute")
async def match_candidate(request: Request, payload: MatchRequest):
    try:
        engine = get_advanced_matching_engine()
        if engine is None:
            raise HTTPException(
                status_code=500,
                detail="Advanced matching engine is not initialized.",
            )

        engine_result = engine.match_candidate_to_jobs(payload)

        skill_score = float(
            engine_result["breakdown"]["skill_match_percentage"])
        exp_score = float(
            engine_result["breakdown"]["experience_match_percentage"])
        edu_score = float(
            engine_result["breakdown"]["education_match_percentage"])
        pref_score = float(
            engine_result["breakdown"]["preferences_match_percentage"])
        missing_skills = engine_result.get("missing_skills", [])
        final_score = float(engine_result.get("match_score", 0.0))
        reasons = build_match_reasons(
            skill_score, exp_score, edu_score, pref_score, missing_skills)
        recommendations = [r for r in engine_result.get("recommendations", []) if r] or build_recommendations(
            missing_skills, exp_score, edu_score)

        return {
            "match_score": round(min(final_score, 100.0), 1),
            "breakdown": {
                "skill_match_percentage": round(skill_score, 1),
                "experience_match_percentage": round(exp_score, 1),
                "education_match_percentage": round(edu_score, 1),
                "preferences_match_percentage": round(pref_score, 1)
            },
            "match_reasons": reasons,
            "missing_skills": missing_skills,
            "recommendations": recommendations,
            "ai_confidence_score": engine_result.get("ai_confidence_score"),
            "semantic_similarity": engine_result.get("semantic_similarity")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(
            f"Matching error while scoring candidate payload: {e}")
        raise HTTPException(
            status_code=500, detail=f"Matching error: {str(e)}")


@app.post("/scan-spam")
@limiter.limit("60/minute")
async def scan_for_spam(request: Request, payload: SpamScanRequest):
    if not spam_model:
        logger.error("Spam model not loaded, cannot scan for spam.")
        raise HTTPException(
            status_code=503, detail="Spam detection model is not available.")
    try:
        probabilities = spam_model.predict_proba([payload.job_description])[0]
        classes = [str(c).lower() for c in spam_model.classes_]
        spam_index = classes.index('spam') if 'spam' in classes else 1
        spam_prob = float(probabilities[spam_index])
        return {"spam_probability": round(spam_prob, 4), "is_safe": spam_prob < 0.5}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Spam scan failed: {str(e)}")


@app.post("/vector/jobs/upsert")
@limiter.limit("120/minute")
async def vector_upsert_job(request: Request, payload: VectorJobUpsertRequest):
    try:
        store = get_job_store()
        job_text = build_job_text(payload.dict())
        embedding = embed_text(job_text)
        metadata = {"job_title": payload.job_title,
                    "location": payload.location}
        store.upsert(payload.job_id, embedding, metadata)
        logger.info(f"Upserted vector for job ID: {payload.job_id}")
        return {"status": "success", "job_id": payload.job_id}
    except HTTPException as e:
        logger.warning(
            f"HTTP exception during job vector upsert for {payload.job_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            f"Failed to upsert vector for job ID: {payload.job_id}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/vector/jobs/{job_id}")
@limiter.limit("120/minute")
async def vector_delete_job(request: Request, job_id: str):
    try:
        store = get_job_store()
        store.remove(job_id)
        logger.info(f"Deleted vector for job ID: {job_id}")
        return {"status": "success", "job_id": job_id}
    except Exception as e:
        logger.exception(f"Failed to delete vector for job ID: {job_id}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vector/resumes/upsert")
@limiter.limit("120/minute")
async def vector_upsert_resume(request: Request, payload: VectorResumeUpsertRequest):
    try:
        store = get_resume_store()
        resume_text = build_resume_text(payload.dict())
        embedding = embed_text(resume_text)
        metadata = {"skills": payload.skills,
                    "experience_years": payload.total_experience_years}
        store.upsert(payload.candidate_id, embedding, metadata)
        logger.info(
            f"Upserted vector for candidate ID: {payload.candidate_id}")
        return {"status": "success", "candidate_id": payload.candidate_id}
    except HTTPException as e:
        logger.warning(
            f"HTTP exception during resume vector upsert for {payload.candidate_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            f"Failed to upsert vector for candidate ID: {payload.candidate_id}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/vector/jobs/search")
@limiter.limit("60/minute")
async def vector_search_jobs(request: Request, payload: VectorSearchRequest):
    try:
        store = get_job_store()
        query_embedding = embed_text(payload.query)
        eligible_ids = set(
            payload.eligible_ids) if payload.eligible_ids else None
        results = store.search(
            query_embedding, payload.top_k, eligible_ids=eligible_ids)
        logger.info(
            f"Job vector search succeeded for query: '{payload.query[:30]}...'")
        return {"results": results}
    except HTTPException as e:
        logger.warning(f"HTTP exception during job vector search: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("Job vector search failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recommendations/jobs")
@limiter.limit("60/minute")
async def recommend_jobs_for_candidate(request: Request, payload: RecommendationRequest):
    try:
        resume_store = get_resume_store()
        job_store = get_job_store()

        candidate_vector = resume_store.get_vector(payload.candidate_id)
        if candidate_vector is None:
            logger.warn(
                f"Cannot make recommendation, no vector found for candidate: {payload.candidate_id}")
            raise HTTPException(
                status_code=404, detail=f"Candidate vector not found for ID: {payload.candidate_id}")

        eligible_ids = set(
            payload.eligible_job_ids) if payload.eligible_job_ids else None
        recommendations = job_store.search(
            candidate_vector, payload.top_k, eligible_ids=eligible_ids)

        logger.info(
            f"Successfully generated {len(recommendations)} recommendations for candidate: {payload.candidate_id}")
        return {"recommendations": recommendations}
    except HTTPException as e:
        logger.warning(
            f"HTTP exception during job recommendation for candidate {payload.candidate_id}: {e.detail}")
        raise e
    except Exception as e:
        logger.exception(
            f"Failed to get recommendations for candidate: {payload.candidate_id}")
        raise HTTPException(status_code=500, detail=str(e))
