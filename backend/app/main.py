from fastapi import FastAPI
import os
from contextlib import asynccontextmanager
from app.api.api import api_router
from app.core.monitor_engine import start_monitoring
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
from app.models import User, APIMonitor, APICheck, MonitoringNode

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Initialize a default Master Node if none exists
    db = SessionLocal()
    try:
        from app.models import MonitoringNode
        if db.query(MonitoringNode).count() == 0:
            master_node = MonitoringNode(name="Studio-Master-01", region="Local", provider="Analytica", is_active=True)
            db.add(master_node)
            db.commit()
    finally:
        db.close()
    
    # Startup: Start the background monitoring task
    start_monitoring()
    yield
   

app = FastAPI(title="API Monitor", lifespan=lifespan)

# Enable CORS for frontend communication
# List all origins explicitly (dev + prod).
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Add production origins from environment variable
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS.extend([origin.strip() for origin in env_origins.split(",")])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Analytica API Monitor is running"}