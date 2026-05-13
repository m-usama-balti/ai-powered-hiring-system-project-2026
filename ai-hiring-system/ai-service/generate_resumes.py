import random

import pandas as pd
from faker import Faker


fake = Faker()

# Define pools of data to make the resumes look realistic
roles = [
    'Frontend Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Machine Learning Engineer'
]
tech_pool = [
    'React', 'Next.js', 'Node.js', 'Express.js', 'MongoDB', 'Python',
    'Docker', 'Kubernetes', 'AWS', 'JavaScript', 'TypeScript',
    'Tailwind CSS', 'SQL', 'PyTorch', 'TensorFlow'
]
education_levels = [
    'BS Computer Science',
    'MS Software Engineering',
    'Bootcamp Graduate',
    'Self-Taught'
]

dataset = []

print('Generating 500 synthetic candidate profiles...')

for i in range(500):
    # Randomize candidate attributes
    role = random.choice(roles)
    experience = random.randint(0, 12)
    num_skills = random.randint(3, 8)
    skills = random.sample(tech_pool, num_skills)

    # Create a realistic "resume text" paragraph
    resume_text = (
        f"Highly motivated {role} with {experience} years of experience building scalable applications. "
        f"Educated with a {random.choice(education_levels)}. "
        f"Proficient in modern technologies including {', '.join(skills)}. "
        f"Passionate about clean code and agile methodologies. Previously worked at {fake.company()}."
    )

    # Append row to our dataset
    dataset.append({
        'candidate_id': f'CAND-{1000 + i}',
        'full_name': fake.name(),
        'email': fake.email(),
        'applied_role': role,
        'years_experience': experience,
        'extracted_skills': ', '.join(skills),
        'resume_text': resume_text
    })

# Convert to a Pandas DataFrame and save to CSV
df = pd.DataFrame(dataset)
df.to_csv('candidates_dataset.csv', index=False)

print("Success! 'candidates_dataset.csv' has been created with 500 rows.")
