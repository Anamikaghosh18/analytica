from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import APICheck, APIMonitor, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/{monitor_id}")
def get_logs(
    monitor_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify ownership of the monitor first
    monitor = db.query(APIMonitor).filter(
        APIMonitor.id == monitor_id,
        APIMonitor.owner_id == current_user.id
    ).first()
    
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found or access denied")

    return (
        db.query(APICheck)
        .filter(APICheck.monitor_id == monitor_id)
        .order_by(APICheck.checked_at.desc())
        .limit(50)
        .all()
    )