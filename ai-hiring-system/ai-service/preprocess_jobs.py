from pathlib import Path

import pandas as pd

from ai_pipeline_utils import (
    build_semantic_text,
    configure_logging,
    deduplicate_dataframe,
    education_score,
    experience_score,
    load_spacy_model,
    load_stop_words,
    normalize_skill_list,
    normalize_text,
    remove_stopwords_and_lemmatize,
    standardize_education,
)

BASE_DIR = Path(__file__).resolve().parent
INPUT_PATH = BASE_DIR / "jobs.csv"
OUTPUT_PATH = BASE_DIR / "jobs_preprocessed.csv"


def preprocess_jobs(input_path: Path = INPUT_PATH, output_path: Path = OUTPUT_PATH) -> pd.DataFrame:
    configure_logging()
    df = pd.read_csv(input_path, encoding="utf-8")

    # Basic cleanup
    text_columns = [
        "job_title", "field", "industry", "experience_level", "education_required",
        "required_skills", "preferred_skills", "job_type", "location", "remote_option", "description",
    ]
    for col in text_columns:
        if col not in df.columns:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str).map(normalize_text)

    if "salary_min" not in df.columns:
        df["salary_min"] = 0
    if "salary_max" not in df.columns:
        df["salary_max"] = 0
    df["salary_min"] = pd.to_numeric(
        df["salary_min"], errors="coerce").fillna(0).astype(int)
    df["salary_max"] = pd.to_numeric(
        df["salary_max"], errors="coerce").fillna(0).astype(int)

    df = deduplicate_dataframe(
        df, ["job_title", "location", "required_skills", "experience_level"])

    # Normalize skills and education
    df["required_skills"] = df["required_skills"].map(normalize_skill_list)
    df["preferred_skills"] = df["preferred_skills"].map(normalize_skill_list)
    df["education_standardized"] = df["education_required"].map(
        standardize_education)

    level_to_years = {
        "junior": 1,
        "mid-level": 4,
        "senior": 8,
        "lead": 12,
        "manager": 10,
    }
    df["experience_years_proxy"] = df["experience_level"].map(
        level_to_years).fillna(3)
    df["experience_score"] = df["experience_years_proxy"].map(experience_score)
    df["education_score"] = df["education_standardized"].map(education_score)

    # Build semantic-ready combined text
    df["combined_job_text"] = df.apply(
        lambda r: build_semantic_text([
            r["job_title"], r["field"], r["industry"], r["experience_level"],
            r["education_standardized"], r["required_skills"], r["preferred_skills"],
            r["job_type"], r["location"], r["remote_option"], r["description"],
        ]),
        axis=1,
    )

    # Tokenization + lemmatization + stopword removal
    nlp = load_spacy_model()
    stop_words = load_stop_words()
    df["job_tokens_lemmas"] = df["combined_job_text"].map(
        lambda t: remove_stopwords_and_lemmatize(t, nlp, stop_words))

    df.to_csv(output_path, index=False, encoding="utf-8")
    return df


if __name__ == "__main__":
    data = preprocess_jobs()
    print(f"jobs_preprocessed.csv created with {len(data)} rows")
