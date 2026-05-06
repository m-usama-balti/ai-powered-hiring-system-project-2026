from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    dataset_path = base_dir / "spam_dataset.csv"

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    if "job_description" not in df.columns or "is_spam" not in df.columns:
        raise ValueError(
            "spam_dataset.csv must contain job_description and is_spam columns")

    X = df["job_description"].astype(str)
    y = df["is_spam"].astype(int)

    model = make_pipeline(TfidfVectorizer(), MultinomialNB())

    print("Training spam detection model...")
    model.fit(X, y)

    output_path = base_dir / "spam_model.pkl"
    joblib.dump(model, output_path)

    print(f"Spam model trained and saved to: {output_path}")


if __name__ == "__main__":
    main()
