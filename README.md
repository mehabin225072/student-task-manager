# 🎓 Student Task Manager — MERN Stack Application

A clean, responsive, and secure full-stack web application designed for students to organize, manage, and track assignments, coursework deadlines, subjects, and study tasks with ease. Built according to the **ICTAK MERN Stack Project Guidelines**.

---

## 1. Project Overview & Problem Statement

### 1.1 Problem Statement
Students constantly juggle multiple academic subjects, lab records, homework assignments, and upcoming examination deadlines across semesters. Without a structured central workspace, deadlines are overlooked, task priorities become confusing, and students experience avoidable academic stress.

### 1.2 Solution
The **Student Task Manager** provides each student with a secure, personal dashboard to:
- Securely register and sign in to their private account.
- Create, view, edit, and delete academic tasks (Full CRUD operations).
- Categorize tasks by **subject**, **due date**, **priority** (Low, Medium, High), and **status** (Pending, Completed).
- Filter and search tasks dynamically in real time without refreshing the page.
- Enforce strict data isolation: students can **only** access and modify their own tasks.

---

## 2. Main Features

- **User Authentication**: Secure student registration and login with JWT token issuance.
- **Password Security**: Automatic salted password hashing with `bcryptjs` (passwords are never saved in plaintext).
- **Task Management (CRUD)**:
  - Add tasks with title, subject, description, priority, status, and due date.
  - View task details with visual badges for priority and overdue deadlines.
  - Edit existing task details via a modal form.
  - Delete tasks with a confirmation popup dialog to prevent accidental loss.
- **Quick Status Toggle**: Single-click checkbox to mark tasks as `Pending` or `Completed`.
- **Dashboard Metrics**: Real-time counter cards displaying **Total Tasks**, **Pending Tasks**, and **Completed Tasks**.
- **Dynamic Filtering & Search**: Instant filtering by status (All, Pending, Completed), priority, subject, and real-time text search.
- **Server-Side Ownership Enforcement**: Server validates JWT tokens and confirms document ownership before every read, update, or delete operation.
- **Complete State Handling**: User interface gracefully handles **Loading**, **Success**, **Empty**, and **Error** states.
- **Modern Responsive Design**: Mobile-first design crafted with CSS variables and accessible typography.

---

## 3. Technologies Used

- **Frontend**:
  - [React.js](https://react.dev/) (v18) — Component-driven Single Page Application (SPA).
  - [Vite](https://vitejs.dev/) — Next-generation frontend build tooling and local dev server.
  - [React Router DOM](https://reactrouter.com/) (v6) — Client-side declarative routing and route protection.
  - [Axios](https://axios-http.com/) — Promise-based HTTP client with request/response interceptors.
  - [Lucide React](https://lucide.dev/) — Lightweight and clean UI iconography.
- **Backend**:
  - [Node.js](https://nodejs.org/) — Server-side JavaScript runtime environment.
  - [Express.js](https://expressjs.com/) — Web framework for building RESTful APIs.
  - [CORS](https://www.npmjs.com/package/cors) — Cross-Origin Resource Sharing middleware.
  - [dotenv](https://www.npmjs.com/package/dotenv) — Environment variable management.
- **Database & Security**:
  - [MongoDB](https://www.mongodb.com/) / [MongoDB Atlas](https://www.mongodb.com/atlas) — Cloud NoSQL document database.
  - [Mongoose](https://mongoosejs.com/) (v8) — Object Data Modeling (ODM) library for MongoDB.
  - [bcryptjs](https://www.npmjs.com/package/bcryptjs) — Salting and password hashing algorithm.
  - [jsonwebtoken (JWT)](https://www.npmjs.com/package/jsonwebtoken) — Stateless authentication token generator and verifier.
- **Version Control & Quality**:
  - [Git](https://git-scm.com/) & [GitHub](https://github.com/) — Distributed version control.

---

## 4. System Architecture & Request Flow

```text
+--------------------------------------------------------------------+
|                       REACT CLIENT (Browser)                       |
|  - Vite + React 18 SPA (Running on Port 5173)                      |
|  - Pages: Login, Register, Dashboard, NotFound                     |
|  - Components: Navbar, TaskCard, TaskModal, StatCard, TaskFilters  |
|  - API Client: Centralized Axios instance with JWT interceptor     |
+--------------------------------------------------------------------+
                                |   ^
       HTTP / JSON (REST API)   |   |   JSON Response / Status Codes
      (Authorization: Bearer)   v   |
+--------------------------------------------------------------------+
|                    EXPRESS / NODE.JS API SERVER                    |
|  - REST Endpoints on Port 5000                                     |
|  - Middleware: CORS, express.json(), authMiddleware, errorHandling |
|  - Controllers: authController.js, taskController.js               |
+--------------------------------------------------------------------+
                                |   ^
       Mongoose ODM Queries     |   |   Documents / Query Results
                                v   |
+--------------------------------------------------------------------+
|                        MONGODB DATABASE                            |
|  - Collections: users, tasks                                       |
|  - Foreign Key Reference: task.user -> user._id                    |
+--------------------------------------------------------------------+
```

---

## 5. Project Folder Structure

```text
student-task-manager/
├── .gitignore                      # Git exclusion rules (node_modules, .env, dist)
├── README.md                       # Complete project documentation
├── client/                         # Frontend Application (React + Vite)
│   ├── .env                        # Local frontend environment variables (never committed)
│   ├── .env.example                # Safe placeholder template for frontend env
│   ├── index.html                  # HTML entry point with mobile viewport
│   ├── package.json                # Frontend dependencies & build scripts
│   ├── vite.config.js              # Vite server & build configuration
│   └── src/
│       ├── main.jsx                # React root mount point
│       ├── App.jsx                 # Route definitions and AuthProvider wrapper
│       ├── index.css               # Clean responsive stylesheet & CSS variables
│       ├── components/             # Reusable UI pieces
│       │   ├── ConfirmModal.jsx    # Deletion confirmation dialog
│       │   ├── Navbar.jsx          # Top navigation bar with student profile & logout
│       │   ├── ProtectedRoute.jsx  # Auth guard route wrapper
│       │   ├── StatCard.jsx        # Summary metric card (Total, Pending, Completed)
│       │   ├── TaskCard.jsx        # Task item with priority badge & status toggle
│       │   ├── TaskFilters.jsx     # Status tabs, search bar & dropdown filters
│       │   └── TaskModal.jsx       # Modal form for adding/editing tasks
│       ├── context/
│       │   └── AuthContext.jsx     # Centralized user authentication state & methods
│       ├── pages/
│       │   ├── Dashboard.jsx       # Student dashboard with tasks & metrics
│       │   ├── Login.jsx           # Student login screen
│       │   ├── Register.jsx        # Student registration screen
│       │   └── NotFound.jsx        # 404 fallback page
│       └── services/
│           └── api.js              # Axios instance with auth interceptors
└── server/                         # Backend Application (Node.js + Express)
    ├── .env                        # Local backend environment variables (never committed)
    ├── .env.example                # Safe placeholder template for backend env
    ├── package.json                # Backend dependencies & npm test scripts
    ├── test-auth.js                # Automated authentication integration test suite
    ├── test-tasks.js               # Automated Task CRUD & ownership test suite
    └── src/
        ├── server.js               # Express application entry point & health check
        ├── config/
        │   └── db.js               # MongoDB connection handler via Mongoose
        ├── controllers/
        │   ├── authController.js   # User registration, login, and me handlers
        │   └── taskController.js   # Task CRUD handlers with user ownership checks
        ├── middleware/
        │   ├── authMiddleware.js   # JWT authentication verification middleware
        │   └── errorMiddleware.js  # Centralized 404 & error handling middleware
        ├── models/
        │   ├── Task.js             # Mongoose Task schema & validation rules
        │   └── User.js             # Mongoose User schema & password hashing methods
        └── routes/
            ├── authRoutes.js       # Auth routing endpoints
            └── taskRoutes.js       # Task routing endpoints
```

---

## 6. Prerequisites

Make sure the following tools are installed on your system before proceeding:
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher (bundled with Node.js)
- **Git**: v2.30.0 or higher ([Download Git](https://git-scm.com/))
- **MongoDB**: A free cloud cluster on [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB service.

---

## 7. Installation & Environment Configuration

### Step 7.1: Clone or Open the Repository
```powershell
cd project2
```

### Step 7.2: Backend Dependencies & Environment Setup
1. Navigate to the `server/` folder and install dependencies:
   ```powershell
   cd server
   npm install
   ```
2. Create your local `server/.env` file by copying the placeholder template:
   ```powershell
   copy .env.example .env
   ```
3. Open `server/.env` and supply your actual configuration values:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_or_local_connection_string_here
   JWT_SECRET=your_strong_private_jwt_secret_key_here
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
   > **Note**: `server/.env` is strictly ignored by Git and will never be committed.

### Step 7.3: Frontend Dependencies & Environment Setup
1. Navigate to the `client/` folder and install dependencies:
   ```powershell
   cd ../client
   npm install
   ```
2. Create your local `client/.env` file:
   ```powershell
   copy .env.example .env
   ```
3. Verify `client/.env` has the local backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

## 8. Running the Application on Windows

Open two separate terminal windows (PowerShell or Command Prompt):

### Terminal 1: Start Express Backend
```powershell
cd server
npm.cmd run dev
```
*Console output:*
```text
🚀 Server running in development mode on port 5000
👉 API Health: http://localhost:5000/api/health
✅ MongoDB Connected: <your-cluster-host>
```

### Terminal 2: Start React Frontend
```powershell
cd client
npm.cmd run dev
```
*Console output:*
```text
  VITE v6.1.0  ready in 240 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your web browser and navigate to: **`http://localhost:5173/`**

---

## 9. REST API Endpoint Overview

All API endpoints are prefixed with `/api`.

| HTTP Method | Route | Description | Auth Required? | Request Body | Success Status | Error Statuses |
| :--- | :--- | :--- | :---: | :--- | :---: | :--- |
| `GET` | `/api/health` | API server health check | No | None | `200 OK` | `500` |
| `POST` | `/api/auth/register` | Register new student | No | `{ name, email, password, department, semester }` | `201 Created` | `400`, `409` |
| `POST` | `/api/auth/login` | Authenticate student | No | `{ email, password }` | `200 OK` | `400`, `401` |
| `GET` | `/api/auth/me` | Fetch logged-in student profile | Yes | None | `200 OK` | `401` |
| `GET` | `/api/tasks` | Get student tasks (with filters) | Yes | Query: `?status=&priority=&search=` | `200 OK` | `401` |
| `GET` | `/api/tasks/stats` | Get dashboard counters | Yes | None | `200 OK` | `401` |
| `POST` | `/api/tasks` | Create new student task | Yes | `{ title, subject, description, priority, status, dueDate }` | `201 Created` | `400`, `401` |
| `GET` | `/api/tasks/:id` | Get single task by ID | Yes | None | `200 OK` | `400`, `401`, `403`, `404` |
| `PUT` | `/api/tasks/:id` | Update entire task | Yes | `{ title, subject, description, priority, status, dueDate }` | `200 OK` | `400`, `401`, `403`, `404` |
| `PATCH`| `/api/tasks/:id/status`| Toggle pending/completed | Yes | `{ status }` | `200 OK` | `400`, `401`, `403`, `404` |
| `DELETE`| `/api/tasks/:id` | Delete task | Yes | None | `200 OK` | `400`, `401`, `403`, `404` |

---

## 10. Automated Testing Instructions

The project includes two end-to-end integration test suites that execute real HTTP queries against the backend and verify database state and ownership:

### 10.1 Run Authentication Test Suite
Verifies registration validation, password hashing, duplicate detection, invalid credentials rejection, and JWT token protection:
```powershell
cd server
npm.cmd run test:auth
```
*Result: 10/10 tests passed.*

### 10.2 Run Task CRUD & Ownership Test Suite
Verifies task creation, filtering, update, quick status toggle, deletion, and cross-student ownership protection (ensuring Student B cannot view or modify Student A's tasks):
```powershell
cd server
npm.cmd run test:tasks
```
*Result: 20/20 tests passed.*

### 10.3 Run Frontend Production Build Check
Verifies module bundling, JSX syntax, and static asset generation:
```powershell
cd client
npm.cmd run build
```
*Result: Bundled cleanly in `client/dist/` with 0 errors.*

---

## 11. Security & Privacy Checklist (ICTAK Milestone 10)

- [x] **No Plaintext Passwords**: Passwords hashed with `bcryptjs` using 10 salt rounds before saving to database.
- [x] **JWT Authorization**: Sensitive endpoints require a valid Bearer token in the `Authorization` header.
- [x] **Strict Ownership Checks**: Tasks are scoped strictly to `req.user._id`; unauthorized modifications return `403 Forbidden`.
- [x] **Environment Variable Hygiene**: All secrets (`MONGODB_URI`, `JWT_SECRET`) reside exclusively in ignored `.env` files.
- [x] **Safe Git Tracking**: `.gitignore` configured to prevent `.env`, `node_modules`, and `dist` from being committed.
- [x] **CORS Protection**: Unknown cross-origin requests are rejected with `403 Forbidden`.

---

## 12. Limitations & Future Enhancements

- **Current Limitations**:
  - Requires active internet connection to communicate with MongoDB Atlas.
  - No automated email or SMS notifications for upcoming deadlines.
- **Planned Enhancements**:
  - Drag-and-drop Kanban board layout for task status columns.
  - Assignment attachment uploads (e.g. PDF/Word notes using Cloudinary).
  - Dark mode / Light mode theme toggle.
