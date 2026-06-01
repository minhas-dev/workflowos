# WorkflowOS

<p align="center">
  <img src="frontend/public/favicon.ico" alt="WorkflowOS Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>The AI-Powered Workflow and Project Management Operating System</strong>
</p>

<p align="center">
  <a href="https://github.com/muhammad-minhas/workflowos/blob/main/LICENSE"><img src="https://img.shields.io/github/license/muhammad-minhas/workflowos?style=for-the-badge&color=blue" alt="License" /></a>
  <a href="https://github.com/muhammad-minhas/workflowos/releases"><img src="https://img.shields.io/github/v/release/muhammad-minhas/workflowos?style=for-the-badge&color=green" alt="Release Version" /></a>
  <img src="https://img.shields.io/badge/PRs-welcome-orange.svg?style=for-the-badge" alt="PRs Welcome" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_19-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_8-%23646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_3-%2338B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind 3" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Claude_Opus-D97706?style=flat-square&logo=anthropic&logoColor=white" alt="Claude" />
  <img src="https://img.shields.io/badge/GPT--4o-412991?style=flat-square&logo=openai&logoColor=white" alt="GPT-4o" />
</p>

---

## 1. HERO SECTION

**WorkflowOS** is a production-hardened, startup-grade project management SaaS platform powered by a highly intelligent multi-agent AI system and a real-time event pipeline. Unlike passive task-tracking systems, WorkflowOS serves as an active **project execution environment** that builds schedules, automates business logic rules, handles natural language voice prompts, predicts potential delivery risks, and offers dynamic document RAG (Retrieval-Augmented Generation) search. 

Designed for squads, startups, engineering leads, freelancers, and enterprise executives, WorkflowOS bridges the gap between structured workflow databases and cognitive AI-assisted engineering execution.

---

## 2. PROJECT OVERVIEW

Traditional project management tools suffer from two major flaws: they are **manually intensive** to keep updated, and they are **completely blind** to execution risks until milestones are already missed.

**WorkflowOS solves these problems by:**
* **Automating Project Generation**: Allowing users to spin up comprehensive, structured projects with sprints, tasks, and estimated milestones simply by writing a single paragraph.
* **Proactively Evaluating Risk**: Monitoring daily task transitions, velocity, and deadline proximity to predict the statistical probability of a bottleneck or delay before it happens.
* **Empowering a Voice & Chat Copilot**: An interactive AI Assistant capable of not only answering questions but actually executing mutations (such as scheduling tasks, reassigning owners, or planning sprints) in real time.
* **Facilitating Intelligent Automation**: Creating rules-based trigger chains (e.g., "when a code review task is marked completed, automatically notify the QA channel and reassign to the lead validator") that execute without human manual intervention.

---

## 3. KEY FEATURES

WorkflowOS is built from the ground up to offer enterprise-grade capabilities. All features documented below are fully implemented in the codebase:

### 🤖 Multi-Agent AI Copilot & Voice AI
* **Conversational Interaction**: A dedicated copilot interface that processes natural language chat and voice input to retrieve workspace contexts or execute dashboard actions.
* **Actionable Execution Agent**: Capable of creating tasks, updating priorities, or rescheduling deadlines on the fly, backed by a deterministic approval engine.
* **Smart Memory Engine**: Stores core workspace parameters, facts, and user preferences across chat sessions to maintain context continuity.

### 📈 Predictive AI Risk Engine & Analytics
* **Sprint Failure Forecasting**: Analyzes past team velocity and pending workloads to output bottleneck and delay warnings.
* **Dynamic Analytics Widgets**: Interactive charts (throughput trackers, milestone burn-downs, activity matrices) rendering data points in real time via Recharts.
* **Automated Executive Summaries**: Condenses active workspace logs and task completion ratios into downloadable markdown, PDF reports, or dynamic presentation deck structures.

### ⚙️ Visual Workflow Automation Engine
* **Triggers & Actions Rules**: Define visual automation matrices (e.g., Status Updates, User Actions) to execute automatic database updates or integration hooks.
* **Service Orchestration**: Fully structured pipeline execution handled by specialized workflow engines.

### 📅 Sprint & Backlog Planning Board
* **Visual Sprint Organizer**: Manage Backlogs, Current Sprints, and Future Milestones with deep detail view panels.
* **Interactive Kanban Board**: Fully draggable layout powered by `@dnd-kit/core` with customizable column transitions and personal (no-project) task support.
* **AI Resource Suggester**: Intelligent estimation of sprint limits and task scoping templates.

### 💬 Threaded Collaboration & Presence
* **Nested Comment Systems**: Deep threaded commentary on tasks, supporting file attachments, formatting, and rich replies.
* **User Mentions & Autocomplete**: Real-time `@username` autocomplete trigger suggestions.
* **WebSocket Presence indicators**: Live indicators showing which users are currently viewing, editing, or actively working on specific tasks.

### 📂 Document Parsing & RAG Engine
* **Multimodal OCR & Text Extraction**: Upload PDFs, DOCX, or images for immediate text extraction using PyMuPDF, pdfminer, and Tesseract OCR.
* **Semantic RAG Queries**: Query workspace documents directly through the AI Copilot to find relevant design parameters, architectural notes, or requirements docs.

### 🔒 Enterprise Hardened Security
* **Granular RBAC**: Multi-tier role-based access control (Viewer, Editor, Manager, Admin) securing API routes and UI views.
* **Two-Factor Authentication (MFA)**: Secure JWT session cookies supported by email OTP and pyotp-powered authenticator steps.
* **Immutable Audit Logs**: Centralized user activity logs and administrative dashboard stat monitors.

---

## 4. SYSTEM ARCHITECTURE

WorkflowOS is designed with an emphasis on loose coupling, strict boundaries, and high security. The system bridges a highly responsive single-page web client with a structured API layer, orchestrated by a collaborative multi-agent AI system.

### Architectural Workflow

```
                        [ USER INTERFACE ]
               React Client / Zustand Store / Tailwind
                                │
              HTTPS REST        │       WebSockets
           (JWT Auth & MFA)     │     (Live Presence)
                                ▼
                       [ FASTAPI GATEWAY ]
          Router Controllers & Custom RBAC Middleware
                                │
       ┌────────────────────────┼────────────────────────┐
       ▼                        ▼                        ▼
[ AI ORCHESTRATION ]   [CORE LOGIC & SERVICES]    [INTEGRATIONS & PARSERS]
 ├─ Coordinator         ├─ Automations            ├─ Slack / GitHub Hooks
 ├─ Copilot Agent       ├─ Risk Analyzer          ├─ pdfminer / PyMuPDF
 ├─ Executive Agent     ├─ RAG Query engine       └─ Tesseract OCR
 └─ Collaboration Agent └─ Email Service
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                ▼
                     [ DATA PERSISTENCE LAYER ]
                  SQLAlchemy ORM (SQLite / Postgres)
```

### Module Structure Map

```
workflowos/
├── backend/                       # FastAPI Backend Root Directory
│   └── app/
│       ├── core/                  # Security, JWT, Database Connections, and RBAC rules
│       ├── api/routes/            # API endpoints (Auth, AI, Tasks, Analytics, Automations)
│       ├── agents/                # AI Agent coordination and memory engines
│       ├── services/              # Core business services (RAG, Risk, Seeds, Email)
│       ├── models/                # SQLAlchemy models defining database entities
│       ├── schemas/               # Pydantic v2 schemas for robust request/response validation
│       └── realtime/              # WebSocket connections and message brokers
└── frontend/                      # React Frontend Root Directory
    └── src/
        ├── components/            # Reusable UI widgets, ConfirmDialogs, and Skeletons
        ├── pages/                 # Full view layouts (AICopilot, AIRisk, Automations, Projects)
        ├── store/                 # Zustand global stores managing Auth, Copilot, & UI state
        ├── services/              # Axios API client and WebSocket connection controllers
        └── layouts/               # Dashboard and Sidebar layouts
```

---

## 5. TECH STACK

WorkflowOS uses modern, production-ready technologies to ensure maximum responsiveness, high system resilience, and fast processing speeds.

| Domain | Technologies Used | Key Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, Vite 8, Zustand 5 | State management, highly fast dev compiles, reactive UI transitions |
| **Styling & UI** | Tailwind CSS 3, Framer Motion, Lucide | Sleek custom dashboards, responsive grid layouts, and micro-animations |
| **Visual Assets** | Recharts, @dnd-kit/core | Interactive analytics charts, beautiful Kanban drag-and-drop mechanics |
| **Backend Framework**| FastAPI 0.136, Uvicorn, Pydantic v2 | Extremely fast ASGI web backend, auto-generated OpenAPI schemas |
| **ORM & Database** | SQLAlchemy 2.0, Alembic, PostgreSQL / SQLite | Robust relational mapping, seamless schema changes, transactional safety |
| **AI Orchestration** | Anthropic Claude SDK, OpenAI GPT-4o, Custom Multi-Agent Framework | Contextual task generation, Risk Analysis, Conversational voice copilot |
| **Document Parsers** | PyMuPDF, pdfminer.six, pytesseract (OCR) | Multi-format PDF processing, text boundary parsing, image character extraction |
| **Auth & Security** | Python-jose (JWT), Bcrypt, PyOTP, Custom RBAC | Standard JSON web token session security, 2FA MFA steps, access validation |
| **Communication** | FastAPI WebSockets, python-dotenv driven SMTP | Live document presence markers, automatic verification emails |

---

## 6. PROJECT STRUCTURE

Below is a simplified tree representing the critical files in the WorkflowOS repository:

```
workflowos/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py             # Settings loader reading .env
│   │   │   ├── database.py           # SQLAlchemy setup
│   │   │   ├── security.py           # Password hashing & JWT validation
│   │   │   └── rbac.py               # Permission verification decoraters
│   │   ├── api/routes/
│   │   │   ├── auth.py               # JWT registration, MFA OTP, Login flow
│   │   │   ├── ai_copilot.py         # Conversational and voice prompts
│   │   │   ├── analytics.py          # Dashboard performance statistics
│   │   │   ├── automations.py        # Custom visual trigger actions
│   │   │   └── tasks.py              # Personal and project task controllers
│   │   ├── agents/
│   │   │   ├── agent_manager.py      # Multi-agent handoff router
│   │   │   └── copilot_agent.py      # Conversational mutation processing
│   │   └── services/
│   │       ├── ai_risk_prediction.py # Sprints delay forecasting calculations
│   │       ├── openai_rag_service.py # Vector lookup and OCR extraction pipeline
│   │       └── automation_service.py # Rule-trigger execution scheduler
│   ├── requirements.txt              # Production python libraries
│   └── alembic.ini                   # Migration settings
└── frontend/
    ├── src/
    │   ├── store/
    │   │   ├── authStore.js          # Handles JWT cache and MFA verification
    │   │   └── aiCopilotStore.js     # Keeps track of chat and Voice logs
    │   ├── pages/
    │   │   ├── LandingPage.jsx       # SaaS homepage & product features showcase
    │   │   ├── DashboardPage.jsx     # Project analytics and stats dashboard
    │   │   ├── AICopilotPage.jsx     # Live AI chat & voice agent panel
    │   │   └── TasksPage.jsx         # Kanban visual board view
    │   └── services/
    │       ├── api.js                # Axios client with request retry interceptors
    │       └── errorSanitizer.js     # Safe error translation service
    ├── tailwind.config.js            # Design tokens & color schemas
    └── package.json                  # Node dependencies
```

---

## 7. INSTALLATION GUIDE

Ensure you have **Python 3.10+** and **Node.js 18+** installed before proceeding with local development.

### Step 1: Clone the Repository
```bash
git clone https://github.com/muhammad-minhas/workflowos.git
cd workflowos
```

### Step 2: Backend Setup
1. Navigate to the backend directory and spin up a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activate the environment:
   * **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
3. Install all python requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure local environment settings:
   Create a `.env` file inside the `backend/` folder (Refer to Section 8 for complete variables).
5. Generate the initial local database schemas:
   ```bash
   python create_tables.py
   ```
6. Start the ASGI local FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will now be live at: **`http://localhost:8000`***
   *Access auto-generated interactive documentation at: **`http://localhost:8000/docs`***

### Step 3: Frontend Setup
1. Open a new terminal window, navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Setup frontend environment limits:
   Create a `.env` file inside the `frontend/` folder:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend application will now be live at: **`http://localhost:5173`***

---

## 8. ENVIRONMENT VARIABLES

The application relies on secure environment configuration. Create a `.env` file in the **`backend/`** directory. Below is the list of expected keys:

| Environment Variable | Required | Default / Example Value | Description |
| :--- | :--- | :--- | :--- |
| `ENVIRONMENT` | Yes | `development` | Active runtime context (`development` or `production`) |
| `DATABASE_URL` | Yes | `sqlite:///./workflowos.db` | Target connection string. Switch to `postgresql://...` in production |
| `SECRET_KEY` | Yes | `workflowos-local-development-secret-change-me` | Secure key utilized to sign JWT sessions cryptographically |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Allowed CORS origins for the client connection |
| `AI_PROVIDER` | Yes | `anthropic` | Active LLM client library service (`anthropic` or `openai`) |
| `ANTHROPIC_API_KEY` | Yes | `sk-xxxx...` | Secure key for Anthropic Claude integration |
| `ANTHROPIC_BASE_URL` | No | `https://agentrouter.org/` | Custom route target endpoint for Anthropic calls (optional) |
| `CLAUDE_MODEL` | No | `claude-opus-4-6` | Active model selection for workspace processing tasks |
| `OPENAI_API_KEY` | No | `sk-proj-xxxx...` | Fallback OpenAI API key (required if `openai` provider active) |
| `OPENAI_CHAT_MODEL` | No | `gpt-4o` | Main OpenAI engine name used |
| `EMAIL_ENABLED` | No | `true` | Allows toggle control over dispatching system OTP and invitations |
| `SMTP_SERVER` | No | `smtp.gmail.com` | Target mail transfer host |
| `SMTP_PORT` | No | `587` | Server connection port |
| `SMTP_EMAIL` | No | `notifications@yourdomain.com` | Dispatch user address credentials |
| `SMTP_PASSWORD` | No | `app-specific-secure-pass` | Secure connection access secret |

> [!WARNING]
> Never commit actual secret keys or API credentials to version control. Standardize deployment rules by securely injecting these variables during runtime deployment.

---

## 9. HOW TO USE

Here are realistic execution workflows demonstrating how to interact with the core features of WorkflowOS:

### 1. Visualizing Sprint Failures with the Risk Engine
1. Navigate to the **Risk Analyzer** panel on the left navigation sidebar.
2. Select an active project from the dropdown. The engine parses task status transitions and velocity.
3. Review predicted bottleneck vectors and delay likelihood ranges instantly plotted on dynamic charts.

### 2. Auto-Generating a Project from Natural Language
1. Open the **AI Project Planner** page.
2. Provide a raw, descriptive prompt in the input box:
   > *"Generate a 3-week project board for a React client login flow redesign, including OAuth setup, MFA verification steps, integration tests, and styling polish."*
3. The system coordinates the `ProjectManagerAgent` to instantly build structural milestones, sprint structures, and specific estimated tasks populated with default descriptions on your board.

### 3. Uploading Design Docs for Semantic RAG Search
1. Open the **AI Copilot** page and click the **Attachments** upload clip icon.
2. Upload a text-based document (e.g., `design_requirements.pdf`).
3. Once the PDF processing and vector indexing complete, prompt the Copilot:
   > *"What were the security parameters specified in our design requirement document for the authentication flow?"*
4. The RAG engine retrieves corresponding paragraphs, references the source, and outputs a refined synthesis of instructions.

### 4. Setting up Automated Trigger Rules
1. Navigate to the **Automations** panel.
2. Click **Create Automation Rule** and configure the fields:
   * **Trigger Event**: `Task Status Transitioned to Done`
   * **Filter condition**: `Priority equals Critical`
   * **Action Hook**: `Notify Team QA Channel & Set Assignee to Lead Validator`
3. Click Save. The visual automation engine now evaluates and triggers this rule instantly when matching mutations occur.

---

## 10. SCREENSHOTS SECTION

*Below are structural visual markers outlining the high-quality layout views. Replace placeholders with deployment screen-captures:*

### Landing Page Showcase
```
+-----------------------------------------------------------------+
|  [Logo] WorkflowOS            Features   Pricing   [Login]      |
|                                                                 |
|         Intelligent Project Execution, Managed by AI            |
|         An active operating system that generates boards,        |
|         predicts risks, and automates pipelines.                |
|                                                                 |
|                    [ Get Started for Free ]                     |
|                                                                 |
|         [Beautiful Dashboard Preview Mockup Graphic]            |
+-----------------------------------------------------------------+
```
*Screenshot reference path: `/docs/screenshots/landing.png`*

### Project Board & Real-Time Analytics
```
+-----------------------------------------------------------------+
| Dashboard  |  Throughput Ratio: [=== 92% ===]   Burn-Down: (/)  |
| -----------|--------------------------------------------------  |
| Projects   |  Active Sprints  | Workloads  | predicted bottlenecks|
| Tasks (Kan)|  [  Chart 1  ]   | [Chart 2]  | Risk: Low (14%)      |
| Risk       |  Weekly progress | Tasks list | Delay: 0 hours       |
+-----------------------------------------------------------------+
```
*Screenshot reference path: `/docs/screenshots/dashboard.png`*

### Conversational Copilot View
```
+-----------------------------------------------------------------+
| Copilot    | Active Thread: Authentication Flow Re-architect    |
| -----------|--------------------------------------------------  |
| History    | [Copilot] I have parsed the requirements doc.      |
|  - Auth    |           Would you like me to create the tasks?   |
|  - Sprints | [User] Yes, create tasks for the MFA setup.        |
|  - OCR RAG | [Copilot] [Task Created] "Configure PyOTP" (ID:14) |
+-----------------------------------------------------------------+
```
*Screenshot reference path: `/docs/screenshots/copilot.png`*

---

## 11. SECURITY & RELIABILITY

WorkflowOS is optimized for deployment in high-security, professional business environments. The system enforces strict architectural layers to ensure total system security:

* **Stateless Cryptographic Sessions**: Fully secure session handling powered by cryptographically signed HS256 JWT tokens. No user data leaks into unsecured client memories.
* **Role-Based Access Control (RBAC)**: All sensitive routes verify permissions using custom backend decorators that authenticate users against a granular authorization hierarchy (`Viewer`, `Editor`, `Manager`, `Admin`).
* **Multi-Factor Authentication & Verification**: Support for high-security environments via standard PyOTP algorithms. Provides users with temporary six-digit security codes via email to verify transactions.
* **Error Sanitization Layer**: Prevents exposure of sensitive backend stack traces or raw database query failures to client views. All exceptions pass through standard sanitizers to keep user UI feedback clean, friendly, and actionable.

---

## 12. FUTURE ROADMAP

WorkflowOS is actively maintained. Below is the projected roadmap for future feature drops:

- [ ] **Offline Sync (PWA)**: Support for offline client transitions with automated conflict resolution when connectivity is restored.
- [ ] **Dynamic Gantt Solver**: Advanced linear scheduling math that automatically re-balances timelines when delays are predicted.
- [ ] **Custom Agent Designer**: Drag-and-drop dashboard to build specialized local AI agents with specific instructions and prompt pipelines.
- [ ] **Multi-Channel Chat Ops**: Fully integrated Slack and Discord chat triggers to control project boards directly from standard enterprise workspaces.

---

## 13. CONTRIBUTING

We welcome contributions from engineering teams, designers, and open-source advocates. Follow the steps below to contribute to the code:

1. **Fork** the Repository.
2. Create a clean **Feature Branch** matching our styling patterns:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes using conventional guidelines:
   ```bash
   git commit -m "feat: implement realtime presence indicators in workspace"
   ```
4. Push your branch upstream:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request** detailing your architectural updates and verification tests.

---

## 14. LICENSE

Distributed under the **MIT License**. Refer to the [LICENSE](LICENSE) file for more information.

---

## 15. AUTHOR

**Muhammad Minhas Asghar**  
*Senior Staff Software Engineer & Platform Architect*

* **GitHub**: [github.com/muhammad-minhas](https://github.com/muhammad-minhas) *(Placeholder)*
* **LinkedIn**: [linkedin.com/in/muhammad-minhas](https://linkedin.com/in/muhammad-minhas) *(Placeholder)*
* **Website / Portfolio**: [minhasasghar.dev](https://minhasasghar.dev) *(Placeholder)*

---
<p align="center">
  Generated with care by the WorkflowOS Platform Engineering Group.
</p>
