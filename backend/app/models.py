from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base


class APIMonitor(Base):
    __tablename__ = "api_monitors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    method = Column(String(10), default="GET")
    
    check_interval_seconds = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, server_default=func.now())

class APICheck(Base):
    __tablename__ = "api_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("api_monitors.id", ondelete="CASCADE"))
    
    response_time_ms = Column(Float)
    status_code = Column(Integer)
    success = Column(Boolean)
    
    checked_at = Column(DateTime, server_default=func.now(), index=True)


    