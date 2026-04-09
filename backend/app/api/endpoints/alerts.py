from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Alert, APIMonitor, User
from app.api.deps import get_current_user
from typing import List
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class AlertResponse(BaseModel):
    id: int
    monitor_id: int
    monitor_name: str
    type: str
    message: str
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Join with APIMonitor to get monitor names and filter by owner
    results = db.query(Alert, APIMonitor.name.label("monitor_name")).join(
        APIMonitor, Alert.monitor_id == APIMonitor.id
    ).filter(APIMonitor.owner_id == current_user.id).all()
    
    alerts = []
    for alert, monitor_name in results:
        alert_dict = alert.__dict__
        alert_dict["monitor_name"] = monitor_name
        alerts.append(alert_dict)
        
    return alerts

@router.post("/{alert_id}/resolve")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = db.query(Alert).join(
        APIMonitor, Alert.monitor_id == APIMonitor.id
    ).filter(Alert.id == alert_id, APIMonitor.owner_id == current_user.id).first()
    
    if alert:
        alert.resolved = True
        db.commit()
    return {"status": "success"}
