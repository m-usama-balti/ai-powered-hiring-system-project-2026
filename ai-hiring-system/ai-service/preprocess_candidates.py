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
INPUT_PATH = BASE_DIR / "candidates.csv"
OUTPUT_PATH = BASE_DIR / "candidates_preprocessed.csv"


def preprocess_candidates(input_path: Path = INPUT_PATH, output_path: Path = OUTPUT_PATH) -> pd.DataFrame:
    configure_logging()
    df = pd.read_csv(input_path, encoding="utf-8")

    text_columns = [
        "full_name", "education", "field", "current_level", "skills", "certifications",
        "languages", "preferred_location", "linkedin", "github", "portfolio", "resume_summary",
    ]
    for col in text_columns:
        if col not in df.columns:
            df[col] = ""
        df[col] = df[col].fillna("").astype(str).map(normalize_text)

    if "experience_years" not in df.columns:
        df["experience_years"] = 0
    df["experience_years"] = pd.to_numeric(
        df["experience_years"], errors="coerce").fillna(0)

    df = deduplicate_dataframe(
        df, ["full_name", "linkedin", "github", "resume_summary"])

    df["skills"] = df["skills"].map(normalize_skill_list)
    df["education_standardized"] = df["education"].map(standardize_education)
    df["experience_score"] = df["experience_years"].map(experience_score)
    df["education_score"] = df["education_standardized"].map(education_score)

    df["combined_profile_text"] = df.apply(
        lambda r: build_semantic_text([
            r["field"], r["current_level"], r["education_standardized"],
            r["skills"], r["certifications"], r["languages"], r["preferred_location"], r["resume_summary"],
        ]),
        axis=1,
    )

    nlp = load_spacy_model()
    stop_words = load_stop_words()
    df["profile_tokens_lemmas"] = df["combined_profile_text"].map(
        lambda t: remove_stopwords_and_lemmatize(t, nlp, stop_words)
    )

    df.to_csv(output_path, index=False, encoding="utf-8")
    return df


if __name__ == "__main__":
    data = preprocess_candidates()
    print(f"candidates_preprocessed.csv created with {len(data)} rows")
