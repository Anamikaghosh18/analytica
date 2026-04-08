import asyncio
from app.database import SessionLocal
from app.models import APIMonitor
from .monitor_engine import check_monitor
import logging

logger = logging.getLogger(__name__)

async def run_scheduler():
    logger.info("Starting API monitoring scheduler...")
    while True:
        try:
            db = SessionLocal()
            monitors = db.query(APIMonitor).filter(APIMonitor.is_active == True).all()
            
            for monitor in monitors:
                # We can fire and forget the check
                asyncio.create_task(check_monitor(monitor.id))
            
            db.close()
        except Exception as e:
            logger.error(f"Scheduler error: {str(e)}")
            
        # Wait for the next interval
        await asyncio.sleep(10) 
