from fastapi import APIRouter
from app.api.endpoints import monitors, checks, metrics, auth

api_router = APIRouter()

api_router.include_router(monitors.router, prefix="/monitors", tags=["Monitors"])
api_router.include_router(checks.router, prefix="/checks", tags=["Checks"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])