from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    api_key: Optional[str] = None
    notification_prefs: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Metrics schemas
class MetricSummary(BaseModel):
    total_monitors: int
    active_monitors: int
    avg_latency_ms: float
    uptime_percentage: float

class TimeseriesPoint(BaseModel):
    timestamp: str
    avg_latency: float

class StatusDistribution(BaseModel):
    status_code: int
    count: int

class PasswordUpdate(BaseModel):
    new_password: str

# Monitor schemas
class MonitorCreate(BaseModel):
    name: str
    url: str
    method: Optional[str] = "GET"
    check_interval_seconds: Optional[int] = 60
    headers: Optional[dict] = None
    is_public: Optional[bool] = False

class MonitorResponse(BaseModel):
    id: int
    name: str
    url: str
    method: str
    check_interval_seconds: int
    headers: Optional[str] = None
    is_public: bool
    owner_id: int

    class Config:
        from_attributes = True

# Feedback schemas
class FeedbackCreate(BaseModel):
    email: Optional[str] = None
    message: str