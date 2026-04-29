# Rokhas.

**Digital Administration Platform**  
*Simplify governmental and administrative procedures for citizens and businesses with an intelligent, automated system.*

## Overview.

Rokhas is a comprehensive digital administration platform designed to simplify governmental and administrative procedures. It offers a centralized hub for submitting requests, tracking ongoing dossiers, and processing administrative acts.

With Rokhas, citizens and businesses can easily manage their administrative needs, while the administration benefits from a secure dashboard and intelligent automated agents to validate and process requests efficiently.

### Why Rokhas?
- **Role-Based Experience**: Tailored interfaces for Citizens, Architects, and Authority Administrators.
- **Centralized Hub**: Manage all administrative procedures from a single, premium dashboard.
- **Intelligent Automation**: Integrated AI agent for RGC compliance and user assistance.
- **Premium Design**: Modern, responsive UI with advanced data visualization and a "paper-feel" aesthetic.

## Key Features.

### Digital Dashboard
- **Role-Specific Metrics**: Real-time stats for permit approvals, active projects, and upcoming deadlines.
- **Application Tracking**: Timeline-based tracking of permit progress from submission to final decision.
*   **Permit Management**: Centralized list of all dossiers with advanced filtering and status monitoring.

### Portals & Management
- **Citizens Portal**: Directory and management of registered citizens and property owners.
- **Business Hub**: Dedicated module for commercial licenses and professional registrations.
- **Evaluation System**: Detailed project scores and expert feedback logs.
- **Analytics & Reports**: Visual reports on approval rates, category distributions, and system health.

### AI-Powered Agent
- Intelligent routing of incoming requests.
- Automatic RGC compliance verification.
- Conversational chatbot support to navigate administrative tasks.

## Tech Stack.

| Layer          | Technology                                      | Purpose |
|----------------|--------------------------------------------------|---------|
| **Frontend**   | Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI | Premium, high-performance UI |
| **Backend**    | FastAPI (Python), SQLAlchemy, Pydantic | Robust & fast core API |
| **Agent**      | LangChain, Anthropic Claude | Intelligent automation & RAG |
| **Database**   | SQLite/PostgreSQL, Redis | Persistent & cached data |

## Installation & Setup.

### Prerequisites
- Node.js 20+
- Python 3.11+
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/pluto-hyp/Rokhas.git
cd Rokhas
```

### 2. Frontend Setup (Next.js)
```bash
cd frontend
pnpm install
pnpm dev
```
*Open http://localhost:3000*

### 3. Backend Setup (FastAPI)
```bash
cd backend
# Create and activate venv
python -m venv venv
.\venv\Scripts\activate
# Install dependencies
pip install -r requirements.txt
# Seed the database with realistic data
python scripts/seed_db.py
# Start the server
python -m uvicorn app.main:app --reload
```
*Open http://localhost:8000/docs to verify the API.*

## Project Structure.

### Backend Structure
```bash
backend/
├── app/
│   ├── main.py                  # FastAPI instance
│   ├── models/                  # SQLAlchemy Models (User, Dossier, Business, Evaluation)
│   ├── schemas/                 # Pydantic Schemas
│   ├── crud/                    # Database Operations
│   ├── api/v1/                  # API Routers (Citizens, Businesses, Reports, etc.)
│   └── services/                # Business Logic & Agent Integration
├── scripts/
│   └── seed_db.py               # Database seeding utility
└── venv/                        # Virtual Environment
```

## License.
This project is licensed under the **MIT License — see the LICENSE file for details**.

---

<div align="center">

**Made with ❤️ for modern digital administration**

⭐ Star the repo if you like the project!

Any questions or feedback? Feel free to [open an issue](https://github.com/pluto-hyp/Rokhas/issues) or reach out.

</div>