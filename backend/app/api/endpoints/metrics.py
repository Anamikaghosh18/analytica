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
    time_range: str = "24h",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aggregated stats: total monitors, active monitors, avg latency, uptime percentage."""
    now = datetime.utcnow()
    lookback_delta = timedelta(hours=24) # default
    if time_range == "1h": lookback_delta = timedelta(hours=1)
    elif time_range == "7d": lookback_delta = timedelta(days=7)
    elif time_range == "30d": lookback_delta = timedelta(days=30)
    
    start_time = now - lookback_delta

    total = db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id).count()
    active = db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id, APIMonitor.is_active == True).count()
    
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    avg_latency = db.query(func.avg(APICheck.response_time_ms)).filter(
        APICheck.monitor_id.in_(monitor_ids),
        APICheck.checked_at >= start_time
    ).scalar() or 0.0
    
    recent_checks = db.query(APICheck).filter(
        APICheck.monitor_id.in_(monitor_ids),
        APICheck.checked_at >= start_time
    ).count()
    success_checks = db.query(APICheck).filter(
        APICheck.monitor_id.in_(monitor_ids),
        APICheck.checked_at >= start_time,
        APICheck.success == True
    ).count()
    
    uptime = (success_checks / recent_checks * 100) if recent_checks > 0 else 100.0
    
    return {
        "total_monitors": total,
        "active_monitors": active,
        "avg_latency_ms": round(avg_latency, 2),
        "uptime_percentage": round(uptime, 2),
        "total_checks": recent_checks
    }

@router.get("/timeseries", response_model=List[TimeseriesPoint])
def get_metrics_timeseries(
    time_range: str = "24h",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Historical latency trends for the selected period."""
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    now = datetime.utcnow()
    
    # Select resolution and lookback based on time_range
    steps = 12
    step_delta = timedelta(hours=2) # default for 24h
    if time_range == "1h": 
        step_delta = timedelta(minutes=5)
        steps = 12 # last hour in 5 min chunks
    elif time_range == "7d":
        step_delta = timedelta(hours=14)
        steps = 12
    elif time_range == "30d":
        step_delta = timedelta(days=2.5)
        steps = 12

    results = []
    # Important: range() here refers to the Python built-in because the 'range' parameter was renamed to 'time_range'
    for i in range(steps, 0, -1):
        start = now - (step_delta * i)
        end = now - (step_delta * (i-1))
        
        avg = db.query(func.avg(APICheck.response_time_ms)).filter(
            APICheck.monitor_id.in_(monitor_ids),
            APICheck.checked_at >= start,
            APICheck.checked_at < end
        ).scalar() or 0.0
        
        results.append({
            "timestamp": start.strftime("%H:%M") if time_range in ["1h", "24h"] else start.strftime("%m-%d"),
            "avg_latency": round(avg, 2)
        })
        
    return results

@router.get("/status-distribution", response_model=List[StatusDistribution])
def get_status_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Breakdown of HTTP status codes seen across the system."""
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
    avg_latency = round(sum(c.response_time_ms for c in checks if c.response_time_ms) / max(total, 1), 2) if total > 0 else 0
    min_latency = round(min((c.response_time_ms for c in checks if c.response_time_ms), default=0), 2)
    max_latency = round(max((c.response_time_ms for c in checks if c.response_time_ms), default=0), 2)
    last_status = checks[0].status_code if checks else None
    last_checked = checks[0].checked_at.isoformat() if checks else None

    # Hourly timeseries (last 12 hours)
    now = datetime.now()
    timeseries_data = []
    # Using range() built-in safely
    for i in range(12, 0, -1):
        start = now - timedelta(hours=i)
        end = now - timedelta(hours=i - 1)
        window = [c for c in checks if c.checked_at and start <= c.checked_at < end]
        avg = round(sum(c.response_time_ms for c in window if c.response_time_ms) / max(len(window), 1), 2) if window else 0
        timeseries_data.append({"timestamp": start.strftime("%H:%M"), "avg_latency": avg, "checks": len(window)})

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
        "timeseries": timeseries_data,
        "recent_checks": recent,
    }

@router.get("/audit-log")
def get_audit_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Global stream of all historical checks for auditing."""
    monitor_ids = [m.id for m in db.query(APIMonitor.id).filter(APIMonitor.owner_id == current_user.id).all()]
    
    logs = db.query(APICheck).filter(APICheck.monitor_id.in_(monitor_ids)).order_by(APICheck.checked_at.desc()).limit(50).all()
    
    return [
        {
            "id": log.id,
            "monitor_name": db.query(APIMonitor.name).filter(APIMonitor.id == log.monitor_id).scalar(),
            "url": db.query(APIMonitor.url).filter(APIMonitor.id == log.monitor_id).scalar(),
            "timestamp": log.checked_at.isoformat() if log.checked_at else None,
            "status_code": log.status_code,
            "latency": log.response_time_ms,
            "success": log.success
        }
        for log in logs
    ]

@router.get("/reliability")
def get_reliability_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculates granular uptime fragments (last 24h) for each monitor."""
    monitors_data = db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id).all()
    now = datetime.now()
    results = []
    
    for m in monitors_data:
        fragments = []
        # Calculate hourly status for last 24 hours
        # Using built-in range() safely
        for i in range(24, 0, -1):
            start = now - timedelta(hours=i)
            end = now - timedelta(hours=i-1)
            
            # Check if there were any failures in this hour
            failed = db.query(APICheck).filter(
                APICheck.monitor_id == m.id,
                APICheck.checked_at >= start,
                APICheck.checked_at < end,
                APICheck.success == False
            ).count()
            
            # Check total attempts in this hour
            total = db.query(APICheck).filter(
                APICheck.monitor_id == m.id,
                APICheck.checked_at >= start,
                APICheck.checked_at < end
            ).count()
            
            if total == 0:
                status = "no_data"
            else:
                status = "operational" if failed == 0 else "degraded"
                
            fragments.append({"timestamp": start.isoformat(), "status": status})
            
        # Total performance context
        total_24h = db.query(APICheck).filter(APICheck.monitor_id == m.id, APICheck.checked_at >= (now - timedelta(hours=24))).count()
        success_24h = db.query(APICheck).filter(APICheck.monitor_id == m.id, APICheck.checked_at >= (now - timedelta(hours=24)), APICheck.success == True).count()
        uptime = round((success_24h / total_24h * 100), 2) if total_24h > 0 else 100.0
        
        results.append({
            "id": m.id,
            "name": m.name,
            "url": m.url,
            "is_active": m.is_active,
            "uptime": uptime,
            "fragments": fragments
        })
        
    return results
