from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    api_key = Column(String(255), unique=True, index=True, nullable=True)
    notification_prefs = Column(String(1000), default='{"email": true, "push": false, "outages": true, "weekly": true}') # JSON string
    
    monitors = relationship("APIMonitor", back_populates="owner")

class APIMonitor(Base):
    __tablename__ = "api_monitors"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    method = Column(String(10), default="GET")
    
    check_interval_seconds = Column(Integer, default=60)
    is_active = Column(Boolean, default=True)
    headers = Column(String(2000), nullable=True) # JSON stored as string
    is_public = Column(Boolean, default=False)
    
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="monitors")
    
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class APICheck(Base):
    __tablename__ = "api_checks"
    
    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("api_monitors.id", ondelete="CASCADE"))
    node_id = Column(Integer, ForeignKey("monitoring_nodes.id"), nullable=True)
    
    response_time_ms = Column(Float)
    status_code = Column(Integer)
    success = Column(Boolean)
    
    checked_at = Column(DateTime, server_default=func.now(), index=True)

class MonitoringNode(Base):
    __tablename__ = "monitoring_nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False) # e.g. US-East-1
    region = Column(String(100), nullable=False)
    provider = Column(String(100), default="AWS")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    monitor_id = Column(Integer, ForeignKey("api_monitors.id", ondelete="CASCADE"))
    type = Column(String(50), default="latency") # latency, outage, etc.
    message = Column(String(500))
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=True)
    message = Column(String(2000), nullable=False)
    created_at = Column(DateTime, server_default=func.now())