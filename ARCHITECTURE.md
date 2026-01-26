# Steady Architecture Design

## 1. Overview
Steady adopts a **Serverless Monorepo** architecture.
- **Frontend**: Vue 3 + Vite + Tailwind CSS (located in `steady/`)
- **Backend**: Vercel Serverless Functions (located in `api/`)
- **Database**: PostgreSQL (via Prisma ORM)
- **Desktop**: Tauri (wraps the frontend)

## 2. Data Layer (Database)
We use **Prisma ORM** with **PostgreSQL**.

### Core Models
- **User**: Stores account info (hashed password).
- **Article**: Stores saved articles, content, and metadata.
- **ReadingProgress**: Tracks user reading position and status.

## 3. Backend (API)
Located in `api/`.
- **/api/auth/**: `login`, `register` (JWT based).
- **/api/articles/**: CRUD for articles.
- **/api/read-url**: Service to fetch and parse external URL content (Server-side to avoid CORS).

## 4. Security & Privacy
- **Password**: Hashed using `bcryptjs`.
- **Authentication**: `HttpOnly` Cookies or Bearer Tokens (JWT).
- **Environment Variables**: API Keys and Database URLs are stored in `.env` (not committed).
- **Encryption**: Sensitive user fields (if any beyond password) can be encrypted at rest using AES.

## 5. Directory Structure Plan
```
/
├── api/                  # Serverless Functions
│   ├── auth/             # Auth endpoints
│   ├── articles/         # Article endpoints
│   └── lib/              # Shared logic (DB client, Auth utils)
├── prisma/               # Database Schema
├── steady/               # Frontend
│   ├── src/
│   │   ├── services/     # API Client Services
│   │   └── stores/       # Pinia Stores (Data Sync)
└── .env                  # Secrets
```
