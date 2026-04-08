from fastapi import APIRouter
from .endpoints import monitors, metrics, checks, auth

api_router = APIRouter()

api_router.include_router(monitors.router, prefix="/monitors", tags=["monitors"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(checks.router, prefix="/checks", tags=["checks"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])