from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.api.api import api_router
from app.core.monitor_engine import start_monitoring

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background monitoring task
    start_monitoring()
    yield
    # Shutdown logic (if any) can go here

app = FastAPI(title="API Monitor", lifespan=lifespan)

app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Analytica API Monitor is running"}