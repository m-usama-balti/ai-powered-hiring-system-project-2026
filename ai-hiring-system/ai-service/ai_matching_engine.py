import asyncio
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import faiss
import joblib
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from ai_pipeline_utils import (
    configure_logging,
    education_score,
    experience_score,
    normalize_skill_list,
    safe_split_skills,
    standardize_education,
)

BASE_DIR = Path(__file__).resolve().parent


@dataclass
class MatchWeights:
    skills: float = 0.40
    experience: float = 0.30
    education: float = 0.20
    preferences: float = 0.10


class AIMatchingEngine:
    def __init__(self, base_dir: Path = BASE_DIR, weights: Optional[MatchWeights] = None):
        configure_logging()
        self.base_dir = base_dir
        self.weights = weights or MatchWeights()

        self.jobs = pd.read_csv(
            base_dir / "jobs_preprocessed.csv", encoding="utf-8")
        self.candidates = pd.read_csv(
            base_dir / "candidates_preprocessed.csv", encoding="utf-8")
        self.skills_df = pd.read_csv(
            base_dir / "skills_preprocessed.csv", encoding="utf-8")

        self.vectorizer = joblib.load(base_dir / "tfidf_vectorizer.pkl")
        self.embedding_bundle = joblib.load(
            base_dir / "sentence_transformer_embeddings.pkl")
        self.faiss_index = faiss.read_index(str(base_dir / "faiss_index.bin"))
        self.metadata = joblib.load(base_dir / "models" / "faiss_metadata.pkl")

        self.sentence_model = SentenceTransformer(
            self.embedding_bundle.get("model_name", "all-MiniLM-L6-v2"))
        self.known_skills = set(
            self.skills_df["skill_name"].fillna("").astype(str).tolist())

    @staticmethod
    def _to_skill_set(skill_text: str) -> set:
        normalized = normalize_skill_list(skill_text)
        return set(safe_split_skills(normalized))

    def extract_skills_from_text(self, text: str) -> List[str]:
        text_l = str(text).lower()
        found = [skill for skill in self.known_skills if skill and skill in text_l]
        return sorted(set(found))

    def _skill_score(self, candidate_skills: str, required_skills: str) -> Tuple[float, List[str]]:
        cand = self._to_skill_set(candidate_skills)
        req = self._to_skill_set(required_skills)
        if not req:
            return 0.5, []
        overlap = cand.intersection(req)
        missing = sorted(req - cand)
        return round(len(overlap) / len(req), 4), missing

    @staticmethod
    def _preference_score(candidate_location: str, job_location: str, remote_option: str) -> float:
        c = str(candidate_location).lower()
        j = str(job_location).lower()
        r = str(remote_option).lower()
        if c and j and c == j:
            return 1.0
        if "remote" in r:
            return 0.8
        if c and j and c.split(",")[-1].strip() == j.split(",")[-1].strip():
            return 0.6
        return 0.3

    def _semantic_similarity(self, candidate_text: str, job_text: str) -> float:
        embeddings = self.sentence_model.encode(
            [candidate_text, job_text], normalize_embeddings=True)
        score = float(np.dot(embeddings[0], embeddings[1]))
        return max(0.0, min(1.0, (score + 1.0) / 2.0))

    def _find_row(self, df: pd.DataFrame, id_column: str, value: str) -> pd.Series:
        rows = df[df[id_column].astype(str) == str(value)]
        if rows.empty:
            raise ValueError(f"{id_column}={value} not found")
        return rows.iloc[0]

    def match_candidate_to_job_sync(self, candidate_id: str, job_id: str) -> Dict:
        candidate = self._find_row(
            self.candidates, "candidate_id", candidate_id)
        job = self._find_row(self.jobs, "job_id", job_id)

        skill_score, missing_skills = self._skill_score(
            str(candidate.get("skills", "")),
            str(job.get("required_skills", "")),
        )

        exp_score = 1.0 - abs(
            float(candidate.get("experience_score", 0.0)) -
            float(job.get("experience_score", 0.0))
        )
        exp_score = max(0.0, min(1.0, exp_score))

        cand_edu = standardize_education(
            str(candidate.get("education_standardized", candidate.get("education", ""))))
        job_edu = standardize_education(
            str(job.get("education_standardized", job.get("education_required", ""))))
        edu_score = 1.0 - abs(education_score(cand_edu) -
                              education_score(job_edu))
        edu_score = max(0.0, min(1.0, edu_score))

        pref_score = self._preference_score(
            str(candidate.get("preferred_location", "")),
            str(job.get("location", "")),
            str(job.get("remote_option", "")),
        )

        weighted = (
            skill_score * self.weights.skills
            + exp_score * self.weights.experience
            + edu_score * self.weights.education
            + pref_score * self.weights.preferences
        )

        semantic_score = self._semantic_similarity(
            str(candidate.get("combined_profile_text", "")),
            str(job.get("combined_job_text", "")),
        )

        # Confidence blends weighted matching with semantic consistency.
        confidence = round((weighted * 0.7 + semantic_score * 0.3) * 100, 2)
        match_pct = round(weighted * 100, 2)

        improvements = []
        if missing_skills:
            improvements.append(
                f"Add missing skills: {', '.join(missing_skills[:8])}")
        if exp_score < 0.6:
            improvements.append("Improve experience alignment for this role")
        if pref_score < 0.5:
            improvements.append(
                "Consider relocation or remote-friendly opportunities")
        if edu_score < 0.6:
            improvements.append(
                "Pursue higher or role-aligned education/certifications")

        return {
            "candidate_id": str(candidate_id),
            "job_id": str(job_id),
            "match_percentage": match_pct,
            "missing_skills": missing_skills,
            "recommended_improvements": improvements,
            "ai_confidence_score": confidence,
            "component_scores": {
                "skills": round(skill_score * 100, 2),
                "experience": round(exp_score * 100, 2),
                "education": round(edu_score * 100, 2),
                "preferences": round(pref_score * 100, 2),
                "semantic": round(semantic_score * 100, 2),
            },
        }

    async def match_candidate_to_job(self, candidate_id: str, job_id: str) -> Dict:
        return await asyncio.to_thread(self.match_candidate_to_job_sync, candidate_id, job_id)

    def match_candidate_to_jobs(self, payload) -> Dict:
        """
        Compatibility wrapper for payload-based FastAPI matching.

        The frontend still submits skill, experience, education, and preference
        fields directly, so this method returns the legacy response shape while
        using the newer AI scoring helpers.
        """
        candidate_skills = list(
            getattr(payload, "candidate_skills", None) or [])
        job_skills = list(getattr(payload, "job_skills", None) or [])
        candidate_text = getattr(payload, "candidate_text", None) or (
            f"{getattr(payload, 'candidate_experience', 0)} years experience "
            + " ".join(candidate_skills)
        )
        job_text = getattr(payload, "job_text", None) or (
            f"{getattr(payload, 'job_experience', 0)} years experience "
            + " ".join(job_skills)
        )

        skill_score, missing_skills = self._skill_score(
            ";".join(candidate_skills), ";".join(job_skills)
        )

        # Preserve the existing scoring contract used by the frontend.
        candidate_exp = float(getattr(payload, "candidate_experience", 0) or 0)
        job_exp = float(getattr(payload, "job_experience", 0) or 0)
        exp_score = 100.0 if job_exp == 0 or candidate_exp >= job_exp else (
            candidate_exp / job_exp) * 100.0

        candidate_education = getattr(payload, "candidate_education", None)
        job_education = getattr(payload, "job_education", None)
        edu_score = 50.0 if not job_education else (100.0 if candidate_education and education_score(
            candidate_education) >= education_score(job_education) else 60.0 if candidate_education else 30.0)

        candidate_preferences = getattr(
            payload, "candidate_preferences", {}) or {}
        job_preferences = getattr(payload, "job_preferences", {}) or {}
        pref_score = 50.0 if not candidate_preferences or not job_preferences else self._preference_score(
            candidate_preferences.get(
                "desired_location") or candidate_preferences.get("location") or "",
            job_preferences.get("location") or "",
            job_preferences.get("job_type") or job_preferences.get(
                "remote_option") or "",
        ) * 100.0

        weighted_score = (
            skill_score * 100.0 * self.weights.skills
            + exp_score * self.weights.experience
            + edu_score * self.weights.education
            + pref_score * self.weights.preferences
        )

        semantic_score = self._semantic_similarity(candidate_text, job_text)
        confidence = round(
            (weighted_score * 0.7 + semantic_score * 100.0 * 0.3), 2)

        return {
            "match_score": round(min(weighted_score, 100.0), 1),
            "breakdown": {
                "skill_match_percentage": round(skill_score * 100.0, 1),
                "experience_match_percentage": round(exp_score, 1),
                "education_match_percentage": round(edu_score, 1),
                "preferences_match_percentage": round(pref_score, 1),
            },
            "match_reasons": [],
            "missing_skills": missing_skills,
            "recommendations": [
                f"Add or highlight these skills: {', '.join(missing_skills[:8])}." if missing_skills else "",
                "Highlight more relevant experience or quantifiable achievements." if exp_score < 70 else "",
                "Add education details or certifications to strengthen alignment." if edu_score < 50 else "",
            ],
            "ai_confidence_score": confidence,
            "semantic_similarity": round(semantic_score * 100.0, 2),
        }

    def _query_index(self, query_text: str, k: int = 10) -> List[Tuple[int, float]]:
        vector = self.sentence_model.encode(
            [query_text], normalize_embeddings=True)
        scores, idxs = self.faiss_index.search(
            np.asarray(vector, dtype="float32"), k)
        pairs = []
        for idx, score in zip(idxs[0], scores[0]):
            if idx < 0:
                continue
            pairs.append((int(idx), float(score)))
        return pairs

    def similar_resumes(self, resume_text: str, top_k: int = 5) -> List[Dict]:
        hits = self._query_index(resume_text, k=max(20, top_k * 4))
        out = []
        for idx, score in hits:
            meta = self.metadata[idx]
            if meta.get("entity_type") != "candidate":
                continue
            out.append(
                {
                    "candidate_id": meta.get("entity_id", ""),
                    "similarity": round((score + 1.0) / 2.0 * 100, 2),
                }
            )
            if len(out) >= top_k:
                break
        return out

    def similar_jobs(self, job_text: str, top_k: int = 5) -> List[Dict]:
        hits = self._query_index(job_text, k=max(20, top_k * 4))
        out = []
        for idx, score in hits:
            meta = self.metadata[idx]
            if meta.get("entity_type") != "job":
                continue
            out.append(
                {
                    "job_id": meta.get("entity_id", ""),
                    "similarity": round((score + 1.0) / 2.0 * 100, 2),
                }
            )
            if len(out) >= top_k:
                break
        return out


def quick_match(candidate_id: str, job_id: str) -> Dict:
    engine = AIMatchingEngine()
    return engine.match_candidate_to_job_sync(candidate_id, job_id)


if __name__ == "__main__":
    engine = AIMatchingEngine()
    c_id = str(engine.candidates.iloc[0]["candidate_id"])
    j_id = str(engine.jobs.iloc[0]["job_id"])
    result = engine.match_candidate_to_job_sync(c_id, j_id)
    print(result)
