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

---
 
## Screenshots.
 
### Landing Page
> The main entry point of the platform — presenting the platform to citizens, architects, and authorities.
 
![Landing Page](<img width="1353" height="644" alt="home" src="https://github.com/user-attachments/assets/9df6f71d-d6e2-42a5-be12-ce007b2bd5eb" />)
 
---
 
### Dashboards
 
#### Citizen Dashboard
> Personalized dashboard for citizens to track their submitted dossiers and receive notifications.
 
![Citizen Dashboard](<img width="1345" height="643" alt="dashboard-citoyen" src="https://github.com/user-attachments/assets/d1c9e5c6-b345-4ad2-b59d-e72ef01c85c7" />)
 
#### Architect Dashboard
> Dedicated workspace for architects to manage technical plans and monitor validation status.
 
![Architect Dashboard](<img width="1341" height="634" alt="dashboard-architect" src="https://github.com/user-attachments/assets/19de4a74-0820-43b6-8145-db9e07cac774" />)
 
#### Authority Dashboard
> Administrative panel for instructeurs to review dossiers, consult AI compliance reports, and issue decisions.
 
![Authority Dashboard](<img width="1340" height="639" alt="dashboard-admin" src="https://github.com/user-attachments/assets/3846bc5d-3394-4fb5-b734-0dad072a3bb3" />)
 
---
 
### Submit a Dossier Request
> Step-by-step form for citizens and architects to submit a construction permit request with all required documents.
 
![Submit Dossier](<img width="1350" height="645" alt="submit-1" src="https://github.com/user-attachments/assets/b38ed28a-c2de-4474-8541-332a92f57d51" />)
 
---

### Agent Rokhas
> AI agent for RGC compliance and user assistance

![Agent Page](<img width="1061" height="631" alt="agent" src="https://github.com/user-attachments/assets/aef15ccc-cead-42aa-a5ca-5740528531e2" />)

 ---
 
### Construction Permit Example
> Example of a construction permit compliance report generated automatically by the Rokhas AI agent, showing conformity checks against the RGC (Règlement Général de Construction).
 
![Construction Permit](<img width="1351" height="670" alt="permit-construction" src="https://github.com/user-attachments/assets/9cff4331-ef4c-4a7a-9319-ab105ae1b4d2" />)
 
> **Example input:**
> | Parameter | Value |
> |---|---|
> | Type | Villa individuelle |
> | Zone | R2 |
> | Height | 7.5 m ✅ (max 8.5 m) |
> | Setback | 4 m ✅ (min 3 m) |
> | Ground Coverage | 55% ✅ (max 60%) |
> | Plot Area | 300 m² |
 
---


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
