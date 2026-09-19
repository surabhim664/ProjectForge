# ⚒️ ProjectForge

<p align="center">
  <img src="assets/projectforge-banner.svg" alt="ProjectForge" width="100%">
</p>

<p align="center">
  <strong>Turn an idea into a build-ready project blueprint.</strong><br>
  ProjectForge transforms rough software ideas into structured project plans with features, technology choices, architecture, and implementation direction.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-2563EB?style=flat-square">
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-16A34A?style=flat-square">
  <img src="https://img.shields.io/badge/Database-MySQL-0EA5E9?style=flat-square&logo=mysql&logoColor=white">
  <img src="https://img.shields.io/badge/Status-Active%20Development-F59E0B?style=flat-square">
</p>

---

## 💡 The Problem

Starting a software project is often harder than writing the first line of code.

A developer may have a simple idea such as:

> “I want to build an app that helps students manage their projects.”

But turning that sentence into a practical plan requires answering:

- What exactly should the product do?
- Who are the users?
- Which technologies should be used?
- What features are essential?
- How should the system be structured?
- Where should development begin?

**ProjectForge bridges that gap.**

---

## 🚀 What is ProjectForge?

ProjectForge is a full-stack project ideation and planning platform that converts a raw project idea into a structured blueprint.

### Idea → Blueprint → Build

Instead of returning only an idea description, ProjectForge organizes the concept into useful development information such as:

- 🎯 Project title
- 📝 Project description
- 🧩 Project type
- 🛠️ Technology stack
- ✨ Core features
- 🏗️ Architecture direction
- 📋 Development tasks
- 📊 Complexity information
- 💾 Persistent project data

The goal is to help developers move from **“I have an idea”** to **“I know what to build next.”**

---

## ✨ Key Features

| Feature | Purpose |
|---|---|
| 💭 Idea Input | Describe a project in natural language |
| 🧠 Blueprint Generation | Convert the idea into structured project information |
| 🛠️ Tech Stack Suggestions | Identify suitable technologies |
| ✨ Feature Breakdown | Turn a concept into concrete functionality |
| 🏗️ Architecture Direction | Provide a starting point for system design |
| 📋 Task Planning | Break the project into implementation steps |
| 📊 Complexity Assessment | Give an initial estimate of project difficulty |
| 💾 MySQL Persistence | Store generated projects for future use |

---

## 🖥️ Product Workflow

<p align="center">
  <img src="assets/workflow.svg" alt="ProjectForge workflow" width="100%">
</p>

### 01 — Describe

The user enters a rough software idea.

### 02 — Forge

ProjectForge processes the idea and creates a structured project blueprint.

### 03 — Understand

The user gets a clearer view of the project's features, technologies, architecture, and complexity.

### 04 — Save

Project information can be persisted through the Node.js/Express backend and MySQL database.

### 05 — Build

The blueprint becomes the starting point for actual development.

---

## 🏗️ Architecture

<p align="center">
  <img src="assets/architecture.svg" alt="ProjectForge architecture" width="100%">
</p>

The current architecture follows a simple full-stack flow:

```text
┌──────────────────┐
│     Frontend     │
│ HTML / CSS / JS  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Express API    │
│     Node.js      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│      MySQL       │
│   projectforge   │
└──────────────────┘
```

This keeps the initial system easy to understand while providing a foundation for future AI-powered capabilities.

---

## 📸 Screenshots

> Add real ProjectForge screenshots here after deployment.

### Landing Page

```text
assets/home.png
```

### Generated Project Blueprint

```text
assets/blueprint.png
```

### Saved Projects

```text
assets/projects.png
```

Recommended repository structure:

```text
assets/
├── projectforge-banner.svg
├── architecture.svg
├── workflow.svg
├── home.png
├── blueprint.png
└── projects.png
```

---

## 🧰 Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- MySQL 8

### Development

- VS Code
- Git
- GitHub

---

## 📂 Project Structure

```text
ProjectForge/
│
├── index.html
├── style.css
├── script.js
│
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── assets/
│   ├── projectforge-banner.svg
│   ├── architecture.svg
│   └── workflow.svg
│
├── .gitignore
└── README.md
```

---

## 🗄️ Database

ProjectForge uses a MySQL database named:

```text
projectforge
```

The main table is:

```text
projects
```

The project data model includes fields such as:

```text
id
title
idea
project_type
description
tech_stack
features
tasks
architecture
complexity_score
complexity_level
estimated_time
created_at
```

This allows project blueprints to move beyond temporary UI output and become persistent application data.

---

## 🔌 Backend

The backend is built using **Node.js + Express.js**.

During local development:

```text
http://localhost:5000
```

A database connectivity endpoint is available for testing:

```http
GET /api/test-db
```

The API layer is designed to support project creation, retrieval, and future project-management operations.

---

## ⚙️ Run Locally

### Prerequisites

Install:

- Node.js
- npm
- MySQL 8
- Git

### 1. Clone the repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd ProjectForge
```

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Create the database

Open MySQL and run:

```sql
CREATE DATABASE projectforge;
```

Create the required `projects` table using the schema expected by `backend/db.js`.

### 4. Configure environment variables

Create:

```text
backend/.env
```

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=projectforge
PORT=5000
```

### 5. Start the backend

```bash
node server.js
```

You should see:

```text
ProjectForge server running on http://localhost:5000
Connected to MySQL database
```

### 6. Launch the frontend

Open `index.html` using a local development server or your preferred frontend workflow.

---

## 🔐 Security

Never commit credentials to GitHub.

Your `.gitignore` should include:

```gitignore
.env
node_modules/
```

Keep database passwords and other secrets inside environment variables.

---

## 🧠 Future AI Vision

ProjectForge currently establishes the full-stack foundation for a much larger idea.

The future architecture can evolve from:

```text
User Idea
    ↓
Structured Blueprint
    ↓
Database
```

into:

```text
User Idea
    ↓
┌─────────────────────────┐
│   AI Project Planner    │
├─────────────────────────┤
│ Problem Analysis        │
│ Feature Decomposition   │
│ Tech Stack Selection    │
│ Architecture Planning   │
│ Database Design         │
│ API Planning            │
│ Development Roadmap     │
└────────────┬────────────┘
             ↓
      Project Workspace
             ↓
          MySQL
```

The long-term goal is to make ProjectForge an **AI-assisted project engineering workspace**, not simply an idea generator.

---

## 🗺️ Roadmap

- [x] ProjectForge landing page
- [x] Idea input interface
- [x] Project blueprint generation
- [x] Node.js backend
- [x] Express API foundation
- [x] MySQL database
- [x] Project persistence foundation
- [ ] Connect all generated fields to database persistence
- [ ] Saved projects dashboard
- [ ] Project search and filtering
- [ ] AI-powered project planning
- [ ] Automatic database schema generation
- [ ] API endpoint recommendations
- [ ] Development roadmap generation
- [ ] Authentication
- [ ] Cloud deployment
- [ ] Project blueprint export

---

## 🎯 What Makes ProjectForge Different?

ProjectForge focuses on the **transition between an idea and implementation**.

The product is not simply:

```text
Idea → AI Answer
```

It aims to become:

```text
Idea
 ↓
Problem
 ↓
Features
 ↓
Technology
 ↓
Architecture
 ↓
Tasks
 ↓
Development
```

That makes the project useful as both a **developer tool** and a foundation for future AI-assisted software development.

---

## 📚 What This Project Demonstrates

ProjectForge demonstrates practical experience with:

- Full-stack web development
- REST API fundamentals
- Node.js and Express
- MySQL database integration
- CRUD-oriented application design
- Frontend/backend communication
- Environment variables
- Git and GitHub workflow
- Product-oriented UI design
- Designing an application with future AI integration in mind

---

## 👩‍💻 Developer

**Surabhi**

Built as a hands-on full-stack project focused on turning software ideas into structured, actionable development plans.

---

## ⭐ If You Like ProjectForge

If this project is useful or interesting, consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  <strong>ProjectForge — Build Smarter.</strong><br>
  <sub>From a rough idea to a clear path forward.</sub>
</p>
