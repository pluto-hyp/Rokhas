# Rokhas.

**Digital Administration Platform**  
*Simplify governmental and administrative procedures for citizens and businesses with an intelligent, automated system.*

## Overview.

Rokhas is a comprehensive digital administration platform designed to simplify governmental and administrative procedures. It offers a centralized hub for submitting requests, tracking ongoing dossiers, and processing administrative acts.

With Rokhas, citizens and businesses can easily manage their administrative needs, while the administration benefits from a secure dashboard and intelligent automated agents to validate and process requests efficiently.

### Why Rokhas?
- Centralized hub for all administrative procedures
- Tailored profiles for Citizens, Businesses, and Administration
- Intelligent automated system to assist users and route requests
- Built with modern 2026 tech stack

## Key Features.

### User Portals
- **Citizens**: Submit personal document requests and track ongoing files.
- **Businesses (Entreprises)**: Manage commercial authorizations and professional services.
- **Administration**: Secure dashboard for agents to validate and process requests.

### AI-Powered Features (Agent)
- Intelligent routing of incoming requests
- Automatic summarization of dossiers
- Data extraction from uploaded documents
- Conversational chatbot support to navigate administrative tasks

## Tech Stack.

| Layer          | Technology                                      | Purpose |
|----------------|--------------------------------------------------|---------|
| **Frontend**   | Next.js (App Router) + TypeScript + Vanilla CSS | Modern, fast UI |
| **Backend**    | FastAPI (Python)                                 | Core API service |
| **Agent**      | Python + LangChain / Anthropic                   | Intelligent automation |
| **Vector Store**| ChromaDB (local)                                | Embeddings storage |
| **Database**   | PostgreSQL / Redis                               | Persistent data |

## Architecture.

The repository employs a microservices-inspired architecture structured into four main components:

1. `frontend/` - User-facing application built with Next.js
2. `backend/` - Core API service for business logic
3. `agent/` - Intelligent automated system for assistance
4. `data/` - Database schemas and volumes

## Installation & Setup.

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git
- Docker & Docker Compose (for complete deployment)

### 1. Clone the repository
```bash
git clone https://github.com/pluto-hyp/Rokhas.git
cd Rokhas
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
npm install
npm run dev
```
*Open http://localhost:3000*

### 3. Backend & Agent Setup
*(Further instructions for backend, agent, and data modules will be populated as they are integrated)*

## Project Structure.
```bash
Rokhas/
├── frontend/               # Next.js app
├── backend/                # FastAPI service
├── agent/                  # Intelligent AI agent (Python)
├── data/                   # Database schemas & persistent data
├── docker-compose.yml      # Orchestration
└── README.md
```
### Backend Structure
```bash
backend/
├── app/
│   ├── main.py                  # FastAPI application instance
│   ├── core/
│   │   ├── config.py            # Environment variables & settings
│   │   ├── security.py          # Password hashing & JWT generation
│   │   └── database.py          # SQLAlchemy engine & session maker
│   ├── models/                  # SQLAlchemy ORM Models (e.g., User, Dossier)
│   ├── schemas/                 # Pydantic schemas (e.g., UserCreate, DossierResponse)
│   ├── crud/                    # Reusable database operations (Create, Read, Update, Delete)
│   ├── api/
│   │   ├── dependencies.py      # FastAPI Depends (e.g., get_db, get_current_user)
│   │   └── v1/                  # API version 1 routers
│   │       ├── auth.py          # Login / Registration
│   │       ├── users.py         # User management
│   │       └── dossiers.py      # Submitting and tracking requests
│   └── services/                # Business logic & external API calls (e.g., calling the Agent)
├── alembic/                     # Database migrations                          
└── .env             # Environment variables
```

## Docker Deployment.

A `docker-compose.yml` file is provided at the root to orchestrate the entire platform. Once all modules are set up, start the complete stack using:
```bash
docker-compose up --build
```

## License.
This project is licensed under the **MIT License — see the LICENSE file for details**.

---

<div align="center">

**Made with ❤️ for modern digital administration**

⭐ Star the repo if you like the project!
Any questions or feedback? Feel free to [open an issue](https://github.com/pluto-hyp/Rokhas/issues) or reach out.

</div>