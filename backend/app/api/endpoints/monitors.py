from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import APIMonitor, User
from app.schemas import MonitorCreate, MonitorResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=MonitorResponse)
def create_monitor(
    data: MonitorCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor = APIMonitor(
        name=data.name,
        url=data.url,
        method=data.method or "GET",
        check_interval_seconds=data.check_interval_seconds or 60,
        owner_id=current_user.id
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    return monitor

@router.get("/", response_model=List[MonitorResponse])
def get_monitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(APIMonitor).filter(APIMonitor.owner_id == current_user.id).all()

@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor = db.query(APIMonitor).filter(
        APIMonitor.id == monitor_id, 
        APIMonitor.owner_id == current_user.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found or access denied")
    return monitor

@router.delete("/{monitor_id}")
def delete_monitor(
    monitor_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    monitor = db.query(APIMonitor).filter(
        APIMonitor.id == monitor_id, 
        APIMonitor.owner_id == current_user.id
    ).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found or access denied")
    db.delete(monitor)
    db.commit()
    return {"message": "Monitor deleted"}