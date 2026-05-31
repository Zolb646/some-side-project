# Builder OS Roadmap

## Vision

Builder OS is a workspace for developers, founders, and teams.

It combines:

- Projects
- Tasks
- Notes
- Documents
- Knowledge
- AI

into a single platform.

---

# Phase 1 — Core Foundation

Goal: Build a usable product without AI.

## Features

### Authentication

- Register
- Login
- Logout
- JWT Authentication

### Projects

- Create Project
- Edit Project
- Delete Project
- View Projects

### Tasks

- Create Task
- Edit Task
- Delete Task
- Task Status
  - Todo
  - In Progress
  - Done

### Notes

- Create Note
- Edit Note
- Delete Note
- Markdown Support

### Dashboard

- Recent Projects
- Recent Tasks

---

## Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui

### Backend

- Kotlin 2.x
- Spring Boot 4.x
- Spring Security
- Spring Data JPA

### Database

- PostgreSQL 17

---

## API Style

REST API

Examples:

GET /projects

POST /projects

PUT /projects/{id}

DELETE /projects/{id}

---

# Phase 2 — Knowledge Layer

Goal: Turn Builder OS into a personal knowledge system.

## Features

### Global Search

Search across:

- Projects
- Tasks
- Notes

### Tags

- Tag Notes
- Tag Projects
- Tag Tasks

### Documents

- Upload Files
- Store Metadata
- Preview Files

Supported:

- PDF
- Markdown
- Text

### Linking

Connect:

- Notes ↔ Projects
- Tasks ↔ Notes
- Documents ↔ Projects

---

# Phase 3 — AI Layer

Goal: Add intelligence to existing data.

## New Service

Python 3.13

FastAPI

### Features

#### Summaries

- Note Summary
- Project Summary
- Document Summary

#### Semantic Search

Ask:

"What notes do I have about JWT?"

"What project used Redis?"

#### AI Chat

Chat with your workspace.

### Architecture

Frontend
↓
Spring Boot
↓
FastAPI
↓
LLM

---

## Communication

Use REST initially.

Spring Boot → FastAPI

---

# Phase 4 — Realtime Features

Goal: Improve collaboration.

## Server-Sent Events

Use for:

- AI streaming responses
- Progress updates

## WebSockets

Use for:

- Live collaboration
- Notifications
- Presence indicators

Examples:

- User joined project
- Task updated
- Note changed

---

# Phase 5 — Knowledge Graph

Goal: Make Builder OS unique.

## Nodes

- Project
- Task
- Note
- Document
- Person
- Technology

## Edges

Examples:

Project
→ Uses
→ PostgreSQL

Project
→ Contains
→ Task

Task
→ References
→ Note

## Features

### Visual Graph

Interactive graph explorer.

### Recommendations

Suggested links:

- Related Notes
- Related Projects
- Related Technologies

---

# Phase 6 — Builder OS Pro

Goal: Become a true operating system for builders.

## Architecture Documents

Store:

- RFCs
- Design Decisions
- Diagrams

## Project Planning

- Roadmaps
- Milestones
- Releases

## Team Features

- Members
- Roles
- Permissions

## Analytics

- Project Velocity
- Completion Rate
- Productivity Trends

---

# Phase 7 — AI Operating Center

Goal: Evolve into a company platform.

## Workspace

- Dashboard
- Documents
- Tasks
- Knowledge
- Analytics
- Chat

## AI

- Report Summaries
- Workflow Generation
- Task Suggestions
- Document Analysis
- Company Knowledge Search

## Long-Term Vision

Builder OS
→ Knowledge Vault
→ Company Brain
→ AI Operating Center

One place where people build, learn, and operate.
