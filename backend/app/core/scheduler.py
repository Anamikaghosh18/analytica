from datetime import datetime, timedelta
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
            now = datetime.now()
            
            # Select active monitors that are due for a check
            # (last_checked is None OR current time > last_checked + interval)
            monitors = db.query(APIMonitor).filter(
                APIMonitor.is_active == True
            ).all()
            
            for monitor in monitors:
                interval = monitor.check_interval_seconds or 60
                last = monitor.last_checked or (now - timedelta(days=1))
                
                if now >= last + timedelta(seconds=interval):
                    # Trigger the check
                    asyncio.create_task(check_monitor(monitor.id))
                    
                    # Update last_checked immediately to prevent double-triggering in next iteration
                    # though create_task is fast, better be safe.
                    monitor.last_checked = now
            
            db.commit()
            db.close()
        except Exception as e:
            logger.error(f"Scheduler error: {str(e)}")
            
        await asyncio.sleep(5) # Check every 5s for due tasks
