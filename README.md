# LocalNotes 📝

**LocalNotes** is a serverless note-taking app built entirely on **LocalStack**, simulating AWS services locally. It's designed as a learning project to explore AWS Lambda, API Gateway, DynamoDB, and local CI/CD — without incurring cloud costs.

---

## 🌟 Features

- Serverless backend (Lambda + API Gateway)
- Notes stored in DynamoDB (via LocalStack)
- Clean React frontend (Vite + Fetch API)
- Fully local development workflow
- Optional GitHub Actions for CI testing

---

## 🧱 Project Structure

localnotes/
├── backend/ # Lambda functions, API Gateway definitions
├── frontend/ # React SPA (Vite)
├── .github/ # CI/CD pipelines (optional)
├── docker-compose.yml # LocalStack & local dev env
└── README.md

yaml
Copy
Edit

---

## 🔧 Technologies Used

| Service     | Local Simulation | Purpose               |
|------------|------------------|------------------------|
| Lambda      | LocalStack       | Serverless logic (note APIs) |
| API Gateway | LocalStack       | RESTful API endpoint   |
| DynamoDB    | LocalStack       | NoSQL storage for notes |
| S3          | (Optional)       | Attachments or backups |
| React       | Vite             | Fast SPA frontend      |

---

## 🚀 Getting Started

### 1. Prerequisites

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/) + NPM/Yarn
- (Optional) [AWS CLI](https://aws.amazon.com/cli/)
- Git

---

### 2. Clone and Boot

```
git clone https://github.com/aylonc22/LocalNotes.git
cd localnotes
docker-compose up -d  # starts LocalStack
```
3. Deploy Backend
Using Serverless Framework (with localstack plugin):
```
cd backend
npm install
sls deploy --stage local
```
4. Start Frontend
```
cd ../frontend
npm install
npm run dev
```
Access the app at http://localhost:5173.

## 🧪 CI/CD (Optional)
A GitHub Actions workflow is included to simulate deployment and run tests locally.

## 🧠 Learning Goals
Gain real-world experience with AWS workflows without cloud costs

Understand how serverless backends and React frontends integrate

Practice clean GitHub project management and documentation

## 📂 Future Ideas
Add user authentication with Cognito (mocked)

Note tagging, search, and sorting

Dark mode and responsive design

Export to Markdown or PDF
