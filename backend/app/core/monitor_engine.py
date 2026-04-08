import httpx
import time
import asyncio
from app.database import SessionLocal
from app.models import APICheck, APIMonitor
import logging

logger = logging.getLogger(__name__)

async def check_monitor(monitor_id: int):
    db = SessionLocal()
    try:
        monitor = db.query(APIMonitor).filter(APIMonitor.id == monitor_id).first()

        if not monitor or not monitor.is_active:
            return

        start = time.time()

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                # Use the method specified in the monitor, default to GET
                method = monitor.method.upper() if monitor.method else "GET"
                response = await client.request(method, monitor.url)

            response_time = (time.time() - start) * 1000

            log = APICheck(
                monitor_id=monitor.id,
                status_code=response.status_code,
                response_time_ms=response_time,
                success=response.status_code < 400
            )

        except Exception as e:
            logger.error(f"Error checking monitor {monitor_id}: {str(e)}")
            log = APICheck(
                monitor_id=monitor.id,
                status_code=None,
                response_time_ms=None,
                success=False
            )

        db.add(log)
        db.commit()
    finally:
        db.close()

def start_monitoring():
    """Entry point to start the background monitoring loop"""
    from .scheduler import run_scheduler
    asyncio.create_task(run_scheduler())
