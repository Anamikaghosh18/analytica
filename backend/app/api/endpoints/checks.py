from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import APICheck

router = APIRouter()

@router.get("/{monitor_id}")
def get_logs(monitor_id: int, db: Session = Depends(get_db)):
    return (
        db.query(APICheck)
        .filter(APICheck.monitor_id == monitor_id)
        .order_by(APICheck.checked_at.desc())
        .limit(50)
        .all()
    )