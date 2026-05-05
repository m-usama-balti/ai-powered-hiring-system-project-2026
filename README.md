# 🚀 TalentAI: Enterprise AI-Powered Hiring System

> A distributed MLOps platform bridging the gap between talent and opportunity using Natural Language Processing and Machine Learning.

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](#)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/Microservice-FastAPI-009688?logo=fastapi&logoColor=white)](#)
[![Scikit-Learn](https://img.shields.io/badge/AI_Model-Scikit_Learn-F7931E?logo=scikitlearn&logoColor=white)](#)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](#)

TalentAI is a comprehensive Final Year Project designed to eliminate hiring bias and reduce time-to-hire. It features a distributed microservice architecture, separating the core business logic from a dedicated Python AI engine.

---

## ✨ Key Features

### 👨‍💻 For Job Seekers

- **AI Resume Parsing:** Upload a PDF resume and let spaCy NLP extract your exact technical skills, certifications, and experience.
- **Smart Job Matching:** Browse opportunities and see your exact "AI Match Score" before applying.
- **Automated Notifications:** Receive instant HTML emails when your application is shortlisted or scheduled for an interview.

### 🏢 For Recruiters

- **Applicant Tracking System (ATS):** A Kanban-style dashboard to manage the hiring pipeline.
- **AI Candidate Ranking:** The system automatically ranks applicants using a custom-trained TF-IDF Cosine Similarity algorithm.
- **AI Interview Copilot:** Dynamically generates technical interview questions based on a candidate's specific skill gaps compared to the job requisition.
- **Hiring Analytics:** Real-time Chart.js visualizations of the candidate funnel and quality scores.

---

## 🏗️ System Architecture

This application utilizes a modern, decoupled architecture:

1. **Client (React/Vite):** A responsive, TailwindCSS-powered frontend featuring locked-viewport dashboards.
2. **Main Server (Node.js/Express):** Handles JWT authentication, CRUD operations, and MongoDB interactions.
3. **AI Microservice (Python/FastAPI):** A dedicated REST API that loads a pre-trained Scikit-Learn `.pkl` model to perform heavy matrix math and NLP parsing asynchronously.

---

## 💻 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js
- **Backend:** Node.js, Express.js, Mongoose, Nodemailer, JSON Web Tokens (JWT)
- **AI Engine:** Python, FastAPI, Scikit-Learn, spaCy, PyPDF2, Pandas
- **Database:** MongoDB Atlas

---

## ⚙️ Local Setup & Installation

Follow these steps to run the application on your local machine.

### 1. Clone the Repository

```bash
git clone [https://github.com/yourusername/talentai.git](https://github.com/yourusername/talentai.git)
cd talentai
```

### 2. Setup the Node.js Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Start the backend server: `npm run dev`

### 3. Setup the AI Microservice

```bash
cd ../ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

_(Optional) Retrain the AI Model:_ `python train_model.py`
Start the FastAPI server: `uvicorn main:app --reload --port 8000`

### 4. Setup the React Frontend

```bash
cd ../client
npm install
```

Start the Vite development server: `npm run dev`

---

## 📸 Screenshots

_(Create an `assets` folder in your repository, take screenshots of your app, and link them here!)_

- **Seeker Dashboard:** `![Seeker Dashboard](./assets/seeker-dash.png)`
- **Recruiter Analytics:** `![Recruiter Analytics](./assets/recruiter-dash.png)`
- **AI Copilot Guide:** `![AI Copilot](./assets/ai-copilot.png)`

---

## 🎓 About the Author

Developed by **[Your Name]** as a Final Year Project for the Federal Urdu University of Arts, Science & Technology (FUUAST).

- **LinkedIn:** [Your LinkedIn Profile URL]
- **GitHub:** [Your GitHub Profile URL]

```

```
"# ai-powered-hiring-system-project-2026" 
