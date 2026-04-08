from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.api import api_router
from app.core.monitor_engine import start_monitoring
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import User, APIMonitor, APICheck # Ensure all models are imported for metadata

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Startup: Start the background monitoring task
    start_monitoring()
    yield
   

app = FastAPI(title="API Monitor", lifespan=lifespan)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Analytica API Monitor is running"}