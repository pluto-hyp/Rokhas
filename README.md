# Rokhas Digital Administration Platform

Rokhas is a comprehensive digital administration platform designed to simplify governmental and administrative procedures for citizens and businesses. The platform offers a centralized hub for submitting requests, tracking ongoing dossiers, and processing administrative acts.

This repository employs a microservices-inspired architecture structured into four main components:

## 🗂 Project Structure

### 1. `frontend/`
The user-facing application built with **Next.js**. It provides a premium, responsive interface tailored for three distinct user profiles:
- **Citizens**: To submit personal document requests and track files.
- **Businesses (Entreprises)**: For commercial authorizations and professional services.
- **Administration**: A secure dashboard for agents to validate and process incoming requests.

*Tech stack*: Next.js (App Router), TypeScript, Vanilla CSS Modules.

### 2. `backend/`
The core API service responsible for business logic, user authentication, and serving data to the frontend. It processes queries, manages transactions, and securely communicates with the database layer.

*Tech stack*: (To be initialized)

### 3. `agent/`
An intelligent, automated system designed to assist both users and administrators. The agent can route requests intelligently, summarize dossiers, extract data from uploaded documents, or provide conversational support (chatbot) to help users navigate their administrative tasks.

*Tech stack*: (To be initialized - likely Python/LangChain or similar)

### 4. `data/`
This directory manages the data layer of the application. It contains database schemas, initialization scripts, seed data, and any persistent data volumes (like relational databases or vector stores used by the AI agent).

*Tech stack*: (To be initialized - e.g., PostgreSQL / Redis / Vector Database)

---

## 🚀 Getting Started

Currently, the `frontend` module is initialized. To run the frontend locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Further instructions for `backend`, `agent`, and `data` will be populated here as they are integrated via Docker Compose).*

## 🐳 Docker Deployment
A `docker-compose.yml` file is provided at the root to orchestrate the entire platform. Once all modules are set up, you will be able to start the complete stack using:
```bash
docker-compose up --build
```