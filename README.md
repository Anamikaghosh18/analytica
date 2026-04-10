# Analytica Platform 🛡️

Analytica is a real-time monitoring and analytics platform featuring a FastAPI backend and a React/Vite frontend.

## 🐳 Dockerized Setup

The project is fully containerized for both development and production deployment.

### Prerequisites
- Docker & Docker Compose

### Quick Start
1. **Configure Environment**:
   Copy the example environment file and fill in your Render/Vercel keys:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. **Launch Services**:
   ```bash
   docker compose up --build
   ```
   - **Frontend**: http://localhost
   - **Backend API**: http://localhost:8000/api
   - **API Docs**: http://localhost:8000/docs

### Project Structure
- `/backend`: FastAPI service with SQLAlchemy 2.0 and Alembic.
- `/frontend`: React + Vite with Nginx production serving.
- `docker-compose.yml`: Orchestrates Postgres, Backend, and Frontend.

---

## 🚀 Deployment

### Backend (Render)
The backend includes a production-optimized `Dockerfile`. Simply connect your GitHub repo to Render and choose **Docker** as the runtime.

### Frontend (Vercel)
The project includes a `vercel.json` for seamless deployment. Vercel will handle the build and proxy requests correctly to your Render backend.
