# ai-service/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from pathlib import Path
import io
import os
import re
import tempfile

import docx2txt
import joblib
import nltk
import spacy
from pdfminer.high_level import extract_text as pdf_extract_text

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------------------------
# 1. INITIALIZATION & MODEL LOADING
# ---------------------------------------------------------
app = FastAPI(title="AI Hiring System Engine", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load spaCy for Resume Parsing
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Error: spaCy model not found. Run 'python -m spacy download en_core_web_sm'")
    nlp = None


def _download_nltk_resources() -> None:
    for resource in ["punkt", "averaged_perceptron_tagger", "maxent_ne_chunker", "words", "stopwords"]:
        try:
            nltk.download(resource, quiet=True)
        except Exception as exc:
            print(f"WARNING: Could not load NLTK resource {resource}: {exc}")


_download_nltk_resources()

# Load the Advanced Scikit-Learn Model
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
        f"WARNING: {SPAM_MODEL_PATH} not found. /scan-spam will be unavailable until model is trained.")
    spam_model = None

# Canonical tech terms used for resilient matching after normalization.
TECH_DICTIONARY = {
    "react", "reactjs", "next.js", "tailwind", "html5", "css3", "html", "css",
    "javascript", "typescript", "node.js", "express.js", "express", "mysql", "mongodb",
    "restful apis", "rest api", "docker", "kubernetes", "git", "github", "linux", "nginx",
    "aws", "python", "ci/cd", "devops", "fastapi", "django", "scikit-learn",
    "pandas", "numpy", "machine learning", "nlp", "azure", "gcp", "sql", "java", "c++", "c#"
}

SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "react js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "node js": "node.js",
    "expressjs": "express.js",
    "express js": "express.js",
    "restful api": "restful apis",
    "restful apis": "restful apis",
    "rest api": "rest api",
    "rest apis": "rest api",
    "machine-learning": "machine learning",
    "ml": "machine learning",
    "html": "html5",
    "css": "css3",
    "github actions": "ci/cd",
    "cicd": "ci/cd"
}

SKILL_DISPLAY_NAMES = {
    "react": "React",
    "next.js": "Next.js",
    "tailwind": "Tailwind",
    "html5": "HTML5",
    "css3": "CSS3",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "express.js": "Express.js",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "restful apis": "RESTful APIs",
    "rest api": "REST API",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "git": "Git",
    "github": "GitHub",
    "linux": "Linux",
    "nginx": "Nginx",
    "aws": "AWS",
    "python": "Python",
    "ci/cd": "CI/CD",
    "devops": "DevOps",
    "fastapi": "FastAPI",
    "django": "Django",
    "scikit-learn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "machine learning": "Machine Learning",
    "nlp": "NLP",
    "azure": "Azure",
    "gcp": "GCP",
    "sql": "SQL",
    "java": "Java",
    "c++": "C++",
    "c#": "C#"
}


def normalize_text(value: str) -> str:
    text = value.lower()
    text = re.sub(r"[^a-z0-9\s\+\#\./-]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def canonical_skill(term: str) -> str:
    normalized = normalize_text(term)
    return SKILL_ALIASES.get(normalized, normalized)


def format_skill(term: str) -> str:
    return SKILL_DISPLAY_NAMES.get(term, term.title())


def extract_pdf_text(content: bytes) -> str:
    try:
        return pdf_extract_text(io.BytesIO(content)) or ""
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Unable to read PDF file: {exc}")


def extract_docx_text(content: bytes) -> str:
    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        extracted = docx2txt.process(temp_path) or ""
        return extracted.replace("\t", " ").strip()
    except Exception as exc:
        raise HTTPException(
            status_code=400, detail=f"Unable to read DOCX file: {exc}")
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass


def extract_resume_text(file: UploadFile, content: bytes) -> str:
    filename = (file.filename or "").lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(content)

    if filename.endswith(".docx"):
        return extract_docx_text(content)

    raise HTTPException(
        status_code=400,
        detail="Unsupported file format. Only PDF and DOCX files are supported."
    )


def extract_name(text: str) -> str | None:
    for sent in nltk.sent_tokenize(text):
        for chunk in nltk.ne_chunk(nltk.pos_tag(nltk.word_tokenize(sent))):
            if hasattr(chunk, "label") and chunk.label() == "PERSON":
                return " ".join(part[0] for part in chunk.leaves())

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


def extract_skills(text: str) -> List[str]:
    stop_words = set(nltk.corpus.stopwords.words('english'))
    word_tokens = nltk.tokenize.word_tokenize(text)
    filtered_tokens = [word for word in word_tokens if word.isalpha(
    ) and word.lower() not in stop_words]
    bigrams_trigrams = list(
        map(' '.join, nltk.everygrams(filtered_tokens, 2, 3)))

    skills_db = {
        'andriod developer',
        'app developer',
        'javascript',
        'java',
        'machine learning',
        'data science',
        'python',
        'css',
        'doctor',
        'teacher',
        'web development',
        'communication',
        'team work',
    }

    found_skills = set()
    for token in filtered_tokens:
        if token.lower() in skills_db:
            found_skills.add(token)

    for ngram in bigrams_trigrams:
        if ngram.lower() in skills_db:
            found_skills.add(ngram)

    return sorted(found_skills)


def extract_education(text: str) -> List[str]:
    reserved_words = ["school", "college", "university",
                      "academy", "faculty", "degree", "institute"]
    education = set()

    for sent in nltk.sent_tokenize(text):
        sent_lower = sent.lower()
        if any(word in sent_lower for word in reserved_words):
            education.add(sent.strip())

    degree_patterns = [
        r"\b(?:b\.?s\.?|m\.?s\.?|ph\.?d\.?|bachelor(?:'s)?|master(?:'s)?|associate(?:'s)?)\b[^.\n]*",
        r"\b(?:computer science|software engineering|information technology|data science|electronics|business administration)\b[^.\n]*",
    ]

    for pattern in degree_patterns:
        for match in re.findall(pattern, text, flags=re.IGNORECASE):
            if match.strip():
                education.add(match.strip())

    return sorted(education)


def parse_resume_text(text: str) -> dict:
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "skills": extract_skills(text),
        "education": extract_education(text),
    }


def extract_experience_years(clean_text: str) -> int:
    # Examples: "3 years", "2+ years", "1 yr"
    matches = re.findall(
        r"\b(\d{1,2})\s*(?:\+\s*)?(?:years?|yrs?)\b", clean_text)
    if matches:
        return max(int(m) for m in matches)

    if "intern" in clean_text or "internship" in clean_text:
        return 1

    return 0


def extract_pdf_text(content: bytes) -> str:
    extracted_chunks = []

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            if page_text:
                extracted_chunks.append(page_text)

    return " ".join(extracted_chunks)


class MatchRequest(BaseModel):
    candidate_skills: List[str] = []
    job_skills: List[str] = []
    candidate_experience: int = 0
    job_experience: int = 0


class SpamScanRequest(BaseModel):
    job_description: str

# ---------------------------------------------------------
# 2. API ENDPOINTS
# ---------------------------------------------------------


@app.get("/")
def read_root():
    return {"status": "Advanced AI Engine Online"}


async def _parse_resume_upload(file: UploadFile):
    if not nlp:
        raise HTTPException(status_code=500, detail="NLP Model missing.")

    if not file.filename:
        raise HTTPException(
            status_code=400, detail="A resume file must be provided")

    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Only PDF and DOCX files are supported."
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    raw_text = extract_resume_text(file, content)
    if not raw_text.strip():
        raise HTTPException(
            status_code=400, detail="Could not extract text from the uploaded resume")

    clean_text = normalize_text(raw_text)
    doc = nlp(clean_text)
    extracted_skills = set(extract_skills(raw_text))

    for token in doc:
        normalized = canonical_skill(token.text)
        if normalized in TECH_DICTIONARY:
            extracted_skills.add(format_skill(normalized))

    for chunk in doc.noun_chunks:
        normalized = canonical_skill(chunk.text)
        if normalized in TECH_DICTIONARY:
            extracted_skills.add(format_skill(normalized))

    for tech in TECH_DICTIONARY:
        if tech in clean_text:
            extracted_skills.add(format_skill(tech))

    return {
        "name": extract_name(raw_text),
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "skills": sorted(extracted_skills),
        "education": extract_education(raw_text),
        "filename": file.filename,
    }


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    try:
        return await _parse_resume_upload(file)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Failed to parse resume: {str(e)}")


@app.post("/parse")
async def parse_resume_legacy(file: UploadFile = File(...)):
    return await parse_resume(file)


@app.post("/match")
async def match_candidate(payload: MatchRequest):
    # 1. Handle Edge Cases: Empty or invalid inputs
    if not payload.job_skills or not isinstance(payload.job_skills, list):
        # Return a neutral score if the job has no requirements.
        return {"match_score": 50.0, "message": "Job has no skill requirements; neutral score assigned."}

    if not payload.candidate_skills or not isinstance(payload.candidate_skills, list):
        # A candidate with no skills is a 0% match against any requirements.
        return {"match_score": 0.0, "message": "Candidate has no skills listed."}

    try:
        # 2. Combine skills and experience into a single string to mimic our training data
        candidate_text = f"{payload.candidate_experience} years experience " + \
            " ".join(payload.candidate_skills).lower()
        job_text = f"{payload.job_experience} years experience " + \
            " ".join(payload.job_skills).lower()

        # 3. SKILL SCORE: Advanced TF-IDF Vectorization
        if global_vectorizer:
            # Use the pre-trained weights from our 3,500 record dataset!
            # The vectorizer expects a list of documents.
            vectors = global_vectorizer.transform([job_text, candidate_text])
            # This prevents shape mismatch errors if one string is empty
            if vectors.shape[0] < 2:
                raise HTTPException(
                    status_code=422, detail="Could not generate a valid comparison vector.")
            skill_score = cosine_similarity(
                vectors[0:1], vectors[1:2])[0][0] * 100
        else:
            # Fallback if the PKL file is missing
            fallback_vec = TfidfVectorizer()
            tfidf_matrix = fallback_vec.fit_transform(
                [job_text, candidate_text])
            if tfidf_matrix.shape[0] < 2:
                raise HTTPException(
                    status_code=422, detail="Could not generate a valid comparison vector.")
            skill_score = cosine_similarity(
                tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100

        # 4. EXPERIENCE SCORE
        exp_score = 100.0 if payload.job_experience == 0 or payload.candidate_experience >= payload.job_experience else (
            payload.candidate_experience / payload.job_experience) * 100

        # 5. FINAL WEIGHTED ALGORITHM (70% Contextual Skills, 30% Hard Experience)
        final_score = min((skill_score * 0.70) + (exp_score * 0.30), 100.0)

        return {
            "match_score": round(final_score, 1),
            "breakdown": {
                "skill_match_percentage": round(skill_score, 1),
                "experience_match_percentage": round(exp_score, 1)
            }
        }
    except Exception as e:
        # Catch-all for any other unexpected errors during the math
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred during matching: {str(e)}")


@app.post("/scan-spam")
async def scan_spam(payload: SpamScanRequest):
    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(
            status_code=400, detail="job_description is required")

    if spam_model is None:
        raise HTTPException(
            status_code=503, detail="Spam model is not trained yet. Run train_spam_model.py first.")

    try:
        probabilities = spam_model.predict_proba([payload.job_description])[0]
        classes = [str(c).lower() for c in spam_model.classes_]

        spam_index = classes.index('spam') if 'spam' in classes else 1
        spam_probability = float(probabilities[spam_index])

        return {
            "spam_probability": round(spam_probability, 4),
            "is_safe": spam_probability < 0.5
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to scan spam probability: {str(e)}")
