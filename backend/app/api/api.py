from fastapi import APIRouter
from app.api.endpoints import monitors, checks, metrics, auth, ws, nodes, alerts, feedback

api_router = APIRouter()

api_router.include_router(monitors.router, prefix="/monitors", tags=["Monitors"])
api_router.include_router(checks.router, prefix="/checks", tags=["Checks"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["Metrics"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(ws.router, prefix="/ws", tags=["WebSocket"])
api_router.include_router(nodes.router, prefix="/nodes", tags=["Nodes"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])