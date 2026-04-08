from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import APIMonitor
from app.schemas import MonitorCreate, MonitorResponse

router = APIRouter()

@router.post("/", response_model=MonitorResponse)
def create_monitor(data: MonitorCreate, db: Session = Depends(get_db)):
    monitor = APIMonitor(
        name=data.name,
        url=data.url,
        method=data.method or "GET"
    )
    db.add(monitor)
    db.commit()
    db.refresh(monitor)
    return monitor

@router.get("/", response_model=List[MonitorResponse])
def get_monitors(db: Session = Depends(get_db)):
    return db.query(APIMonitor).all()

@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(APIMonitor).filter(APIMonitor.id == monitor_id).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    return monitor

@router.delete("/{monitor_id}")
def delete_monitor(monitor_id: int, db: Session = Depends(get_db)):
    monitor = db.query(APIMonitor).filter(APIMonitor.id == monitor_id).first()
    if not monitor:
        raise HTTPException(status_code=404, detail="Monitor not found")
    db.delete(monitor)
    db.commit()
    return {"message": "Monitor deleted"}