import httpx
import time
import asyncio
from app.database import SessionLocal
from app.models import APICheck, APIMonitor, MonitoringNode
from app.core.ws_manager import manager
from sqlalchemy import func
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

async def check_monitor(monitor_id: int):
    db = SessionLocal()
    try:
        monitor = db.query(APIMonitor).filter(APIMonitor.id == monitor_id).first()

        if not monitor or not monitor.is_active:
            return

        # Assign to a random active node to simulate distributed monitoring
        node = db.query(MonitoringNode).filter(MonitoringNode.is_active == True).order_by(func.random()).first()
        node_id = node.id if node else None

        start = time.time()
        status_code = None
        response_time = None
        success = False

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                method = monitor.method.upper() if monitor.method else "GET"
                response = await client.request(method, monitor.url)
                status_code = response.status_code
                response_time = (time.time() - start) * 1000
                success = status_code < 400

        except Exception as e:
            logger.error(f"Error checking monitor {monitor_id}: {str(e)}")
            success = False

        log = APICheck(
            monitor_id=monitor.id,
            node_id=node_id,
            status_code=status_code,
            response_time_ms=response_time,
            success=success
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        # Real-time Broadcast via WebSocket
        broadcast_payload = {
            "type": "telemetry",
            "monitor_id": monitor.id,
            "monitor_name": monitor.name,
            "status_code": status_code,
            "response_time_ms": round(response_time, 2) if response_time else None,
            "success": success,
            "node_name": node.name if node else "Global",
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
        await manager.broadcast(broadcast_payload)

    finally:
        db.close()

def start_monitoring():
    from .scheduler import run_scheduler
    asyncio.create_task(run_scheduler())
