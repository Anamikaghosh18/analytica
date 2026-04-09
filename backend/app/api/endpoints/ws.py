from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.ws_manager import manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We mostly use this for server -> client broadcast,
            # but we keep the connection alive by listening for any data.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket telemetry error: {str(e)}")
        manager.disconnect(websocket)
