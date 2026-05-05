# ai-service/train_model.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os

print("Initializing Advanced AI Training Sequence...")

try:
    # 1. Load the Enriched Dataset
    df = pd.read_csv('enriched_industry_data.csv')

    # We train specifically on the combined super-string we generated
    training_data = df['ai_training_corpus'].dropna().tolist()
    print(f"Successfully loaded {len(training_data)} records from dataset.")

    # 2. Train the TF-IDF Vectorizer (Advanced NLP Configuration)
    print("Analyzing vocabulary weights and contextual n-grams...")

    # ngram_range=(1, 2) means the AI will learn single words AND pairs
    # e.g., it learns "React" and "React Native" as distinct, important concepts
    vectorizer = TfidfVectorizer(
        stop_words='english',
        lowercase=True,
        ngram_range=(1, 2),
        max_features=5000  # Keep the top 5000 most important tech terms
    )

    # The AI studies the corpus and learns global weights
    vectorizer.fit(training_data)

    # 3. Save the advanced "Brain" to disk
    model_filename = 'advanced_tfidf_vectorizer.pkl'
    joblib.dump(vectorizer, model_filename)

    print(
        f"Success! Model trained on a vocabulary of {len(vectorizer.vocabulary_)} terms.")
    print(f"Advanced AI Brain saved as: {model_filename}")
    print("You are now ready to run your FastAPI server!")

except FileNotFoundError:
    print("ERROR: 'enriched_industry_data.csv' not found. Please run generate_dataset.py first.")
