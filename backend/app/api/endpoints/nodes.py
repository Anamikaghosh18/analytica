from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MonitoringNode, User
from app.api.deps import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter()

class NodeCreate(BaseModel):
    name: str
    region: str
    provider: str = "AWS"

class NodeResponse(BaseModel):
    id: int
    name: str
    region: str
    provider: str
    is_active: bool

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NodeResponse])
def get_nodes(db: Session = Depends(get_db)):
    return db.query(MonitoringNode).all()

@router.post("/", response_model=NodeResponse)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    db_node = MonitoringNode(**node.model_dump())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node
