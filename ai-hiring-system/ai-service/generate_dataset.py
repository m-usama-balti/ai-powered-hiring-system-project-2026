import pandas as pd
import numpy as np
import random

# --- Configuration ---
NUM_SAMPLES = 5000
OUTPUT_FILE = "enriched_industry_data.csv"

# --- Core Data Elements ---
JOB_TITLES = {
    "Software Engineering": ["Software Engineer", "Senior Software Engineer", "Staff Software Engineer", "Principal Engineer", "Engineering Manager"],
    "Data Science": ["Data Scientist", "Senior Data Scientist", "Lead Data Scientist", "Data Science Manager"],
    "Product Management": ["Product Manager", "Senior Product Manager", "Group Product Manager", "Director of Product"],
    "Cybersecurity": ["Security Analyst", "Security Engineer", "Penetration Tester", "Cybersecurity Consultant"],
    "Cloud Engineering": ["Cloud Engineer", "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Architect"]
}

LEVELS = {
    "Entry": (0, 2),
    "Mid-Level": (2, 5),
    "Senior": (5, 10),
    "Lead/Principal": (8, 15),
    "Manager": (7, 20)
}

SKILLS_BY_INDUSTRY = {
    "Software Engineering": ["Python", "Java", "C++", "Go", "JavaScript", "React", "Node.js", "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Microservices", "System Design"],
    "Data Science": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Spark", "Statistics", "Machine Learning", "Data Mining", "Big Data"],
    "Product Management": ["Agile", "Scrum", "Roadmapping", "User Research", "A/B Testing", "Market Analysis", "JIRA", "Product Strategy"],
    "Cybersecurity": ["Network Security", "Cryptography", "SIEM", "Intrusion Detection", "Firewalls", "Malware Analysis", "Ethical Hacking", "ISO 27001"],
    "Cloud Engineering": ["AWS", "Azure", "GCP", "Terraform", "Ansible", "CI/CD", "Jenkins", "Prometheus", "Grafana", "Kubernetes", "Docker"]
}

CERTIFICATIONS_BY_INDUSTRY = {
    "Software Engineering": ["AWS Certified Developer", "Certified Kubernetes Application Developer (CKAD)"],
    "Data Science": ["TensorFlow Developer Certificate", "Google Professional Data Engineer"],
    "Product Management": ["Certified Scrum Product Owner (CSPO)", "Pragmatic Marketing Certified (PMC)"],
    "Cybersecurity": ["Certified Information Systems Security Professional (CISSP)", "Certified Ethical Hacker (CEH)", "CompTIA Security+"],
    "Cloud Engineering": ["AWS Certified Solutions Architect", "Microsoft Certified: Azure Administrator", "Google Certified Professional Cloud Architect", "Certified Kubernetes Administrator (CKA)"]
}

# --- Helper Functions ---


def get_level_and_experience(title):
    """Determines a suitable level and experience range based on the job title."""
    if "Senior" in title or "Lead" in title:
        level = "Senior"
    elif "Staff" in title or "Principal" in title:
        level = "Lead/Principal"
    elif "Manager" in title:
        level = "Manager"
    else:
        level = random.choice(["Entry", "Mid-Level"])

    min_exp, max_exp = LEVELS[level]
    experience = random.randint(min_exp, max_exp)
    return level, experience


def generate_skills(industry, num_skills=5):
    """Generates a random set of skills for a given industry."""
    return random.sample(SKILLS_BY_INDUSTRY[industry], k=min(num_skills, len(SKILLS_BY_INDUSTRY[industry])))


def generate_certifications(industry, has_cert_prob=0.4):
    """Generates a random set of certifications for a given industry."""
    if random.random() < has_cert_prob and CERTIFICATIONS_BY_INDUSTRY[industry]:
        return random.sample(CERTIFICATIONS_BY_INDUSTRY[industry], k=random.randint(1, len(CERTIFICATIONS_BY_INDUSTRY[industry])))
    return []


def create_ai_training_corpus(row):
    """
    Creates a weighted, descriptive string for AI model training.
    This "Super-String" helps the model understand context and hierarchy.
    """
    # Weights emphasize important features
    title_str = f"Job Title: {row['job_title']} " * 3
    level_str = f"Career Level: {row['level']} " * 2
    industry_str = f"Industry: {row['industry']} " * 2
    exp_str = f"Years of Experience: approximately {row['years_of_experience']} years. "
    skills_str = f"Key Skills: {', '.join(row['skills'])}. " * 3
    certs_str = f"Relevant Certifications: {', '.join(row['certifications'])}. " if row[
        'certifications'] else ""

    return title_str + level_str + industry_str + exp_str + skills_str + certs_str


# --- Main Data Generation Logic ---
print("Starting generation of enriched synthetic dataset...")
data = []
for i in range(NUM_SAMPLES):
    industry = random.choice(list(JOB_TITLES.keys()))
    title = random.choice(JOB_TITLES[industry])
    level, experience = get_level_and_experience(title)
    skills = generate_skills(industry, num_skills=random.randint(4, 8))
    certifications = generate_certifications(industry)

    data.append({
        "industry": industry,
        "job_title": title,
        "level": level,
        "years_of_experience": experience,
        "skills": skills,
        "certifications": certifications
    })
    if (i + 1) % 500 == 0:
        print(f"  ... generated {i + 1}/{NUM_SAMPLES} records.")

df = pd.DataFrame(data)

# --- Create the AI Super-String ---
print("Creating AI training corpus string for each record...")
df['ai_training_corpus'] = df.apply(create_ai_training_corpus, axis=1)

# --- Save to CSV ---
df.to_csv(OUTPUT_FILE, index=False)

print("-" * 30)
print(f"Success! Dataset saved to '{OUTPUT_FILE}'")
print(f"Total records generated: {len(df)}")
print("\n--- Sample Record ---")
print(df.head(1).to_dict('records')[0])
print("\n--- Sample AI Training Corpus ---")
print(df['ai_training_corpus'].iloc[0])
print("-" * 30)
