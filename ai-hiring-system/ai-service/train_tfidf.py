from pathlib import Path
from typing import Dict, List, Tuple

import faiss
import joblib
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer

from ai_pipeline_utils import MODEL_DIR, configure_logging
from preprocess_candidates import preprocess_candidates
from preprocess_jobs import preprocess_jobs
from preprocess_skills import preprocess_skills

BASE_DIR = Path(__file__).resolve().parent


def load_or_preprocess() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    jobs_path = BASE_DIR / "jobs_preprocessed.csv"
    candidates_path = BASE_DIR / "candidates_preprocessed.csv"
    skills_path = BASE_DIR / "skills_preprocessed.csv"

    jobs = preprocess_jobs() if not jobs_path.exists(
    ) else pd.read_csv(jobs_path, encoding="utf-8")
    candidates = preprocess_candidates() if not candidates_path.exists(
    ) else pd.read_csv(candidates_path, encoding="utf-8")
    skills = preprocess_skills() if not skills_path.exists(
    ) else pd.read_csv(skills_path, encoding="utf-8")
    return jobs, candidates, skills


def train_tfidf_vectorizer(corpus: List[str]) -> TfidfVectorizer:
    vectorizer = TfidfVectorizer(
        max_features=30000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95,
        sublinear_tf=True,
        strip_accents="unicode",
    )
    vectorizer.fit(corpus)
    return vectorizer


def compute_sentence_embeddings(model: SentenceTransformer, texts: List[str], batch_size: int = 64) -> np.ndarray:
    embeddings = model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embeddings.astype("float32")


def build_faiss_index(embeddings: np.ndarray) -> faiss.Index:
    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)
    index.add(embeddings)
    return index


def main() -> None:
    configure_logging()
    MODEL_DIR.mkdir(exist_ok=True)

    jobs, candidates, skills = load_or_preprocess()

    jobs_text = jobs["job_tokens_lemmas"].fillna("").astype(str).tolist()
    candidates_text = candidates["profile_tokens_lemmas"].fillna(
        "").astype(str).tolist()
    skills_text = skills["skill_tokens_lemmas"].fillna("").astype(str).tolist()

    corpus = jobs_text + candidates_text + skills_text
    vectorizer = train_tfidf_vectorizer(corpus)

    # Save with both requested names
    joblib.dump(vectorizer, BASE_DIR / "advanced_tfidf_vectorizer.pkl")
    joblib.dump(vectorizer, BASE_DIR / "tfidf_vectorizer.pkl")

    jobs_tfidf = vectorizer.transform(jobs_text)
    candidates_tfidf = vectorizer.transform(candidates_text)
    skills_tfidf = vectorizer.transform(skills_text)

    joblib.dump(
        {
            "jobs_tfidf": jobs_tfidf,
            "candidates_tfidf": candidates_tfidf,
            "skills_tfidf": skills_tfidf,
        },
        MODEL_DIR / "tfidf_feature_matrices.pkl",
    )

    # Sentence-transformer semantic embeddings
    sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

    combined_texts = jobs["combined_job_text"].fillna("").astype(str).tolist() + candidates[
        "combined_profile_text"
    ].fillna("").astype(str).tolist()

    embeddings = compute_sentence_embeddings(sentence_model, combined_texts)

    metadata: List[Dict[str, str]] = []
    for _, row in jobs.iterrows():
        metadata.append(
            {"entity_type": "job", "entity_id": str(row.get("job_id", ""))})
    for _, row in candidates.iterrows():
        metadata.append({"entity_type": "candidate",
                        "entity_id": str(row.get("candidate_id", ""))})

    joblib.dump(
        {
            "embeddings": embeddings,
            "metadata": metadata,
            "model_name": "all-MiniLM-L6-v2",
        },
        BASE_DIR / "sentence_transformer_embeddings.pkl",
    )

    faiss_index = build_faiss_index(embeddings)
    faiss.write_index(faiss_index, str(BASE_DIR / "faiss_index.bin"))

    # Persist metadata for vector search lookups
    joblib.dump(metadata, MODEL_DIR / "faiss_metadata.pkl")

    print("Saved:")
    print("- advanced_tfidf_vectorizer.pkl")
    print("- tfidf_vectorizer.pkl")
    print("- sentence_transformer_embeddings.pkl")
    print("- faiss_index.bin")


if __name__ == "__main__":
    main()
