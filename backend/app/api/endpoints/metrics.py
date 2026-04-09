from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import APIMonitor, APICheck, User
from app.api.deps import get_current_user
from app.schemas import MetricSummary, TimeseriesPoint, StatusDistribution
from typing import List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary", response_model=MetricSummary)
def get_metrics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Total and Active Monitors
    total = db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id).count()
    active = db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id, APIMonitor.is_active == True).count()
    
    # Average Latency
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    avg_latency = db.query(func.avg(APICheck.response_time_ms)).filter(APICheck.monitor_id.in_(monitor_ids)).scalar() or 0.0
    
    # Uptime Percentage (Last 24h)
    recent_checks = db.query(APICheck).filter(APICheck.monitor_id.in_(monitor_ids)).count()
    success_checks = db.query(APICheck).filter(APICheck.monitor_id.in_(monitor_ids), APICheck.success == True).count()
    
    uptime = (success_checks / recent_checks * 100) if recent_checks > 0 else 100.0
    
    return {
        "total_monitors": total,
        "active_monitors": active,
        "avg_latency_ms": round(avg_latency, 2),
        "uptime_percentage": round(uptime, 2)
    }

@router.get("/timeseries", response_model=List[TimeseriesPoint])
def get_metrics_timeseries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    
    # Simple hourly aggregation for the last 12 hours
    results = []
    now = datetime.now()
    for i in range(12, 0, -1):
        start = now - timedelta(hours=i)
        end = now - timedelta(hours=i-1)
        
        avg = db.query(func.avg(APICheck.response_time_ms)).filter(
            APICheck.monitor_id.in_(monitor_ids),
            APICheck.checked_at >= start,
            APICheck.checked_at < end
        ).scalar() or 0.0
        
        results.append({
            "timestamp": start.strftime("%H:%M"),
            "avg_latency": round(avg, 2)
        })
        
    return results

@router.get("/status-distribution", response_model=List[StatusDistribution])
def get_status_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    
    stats = db.query(
        APICheck.status_code,
        func.count(APICheck.id).label("count")
    ).filter(APICheck.monitor_id.in_(monitor_ids)).group_by(APICheck.status_code).all()
    
    return [{"status_code": s[0] or 0, "count": s[1]} for s in stats]

@router.get("/monitor/{monitor_id}")
def get_monitor_stats(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Per-endpoint detailed stats: latency, uptime, check history, hourly timeseries."""
    monitor = db.query(APIMonitor).filter(
        APIMonitor.id == monitor_id,
        APIMonitor.owner_id == current_user.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")

    checks = db.query(APICheck).filter(APICheck.monitor_id == monitor_id).order_by(APICheck.checked_at.desc()).limit(100).all()

    total = len(checks)
    success = sum(1 for c in checks if c.success)
    uptime = round((success / total * 100), 2) if total > 0 else 100.0
    avg_latency = round(sum(c.response_time_ms for c in checks if c.response_time_ms) / max(total, 1), 2)
    min_latency = round(min((c.response_time_ms for c in checks if c.response_time_ms), default=0), 2)
    max_latency = round(max((c.response_time_ms for c in checks if c.response_time_ms), default=0), 2)
    last_status = checks[0].status_code if checks else None
    last_checked = checks[0].checked_at.isoformat() if checks else None

    # Hourly timeseries (last 12 hours)
    now = datetime.now()
    timeseries = []
    for i in range(12, 0, -1):
        start = now - timedelta(hours=i)
        end = now - timedelta(hours=i - 1)
        window = [c for c in checks if c.checked_at and start <= c.checked_at < end]
        avg = round(sum(c.response_time_ms for c in window if c.response_time_ms) / max(len(window), 1), 2) if window else 0
        timeseries.append({"timestamp": start.strftime("%H:%M"), "avg_latency": avg, "checks": len(window)})

    # Recent check log (last 20)
    recent = [
        {
            "id": c.id,
            "checked_at": c.checked_at.isoformat() if c.checked_at else None,
            "status_code": c.status_code,
            "response_time_ms": c.response_time_ms,
            "success": c.success,
        }
        for c in checks[:20]
    ]

    return {
        "monitor": {
            "id": monitor.id,
            "name": monitor.name,
            "url": monitor.url,
            "method": monitor.method,
            "check_interval_seconds": monitor.check_interval_seconds,
            "is_active": monitor.is_active,
        },
        "stats": {
            "total_checks": total,
            "uptime_percentage": uptime,
            "avg_latency_ms": avg_latency,
            "min_latency_ms": min_latency,
            "max_latency_ms": max_latency,
            "last_status_code": last_status,
            "last_checked": last_checked,
        },
        "timeseries": timeseries,
        "recent_checks": recent,
    }
