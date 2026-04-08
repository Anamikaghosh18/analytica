from pydantic import BaseModel, EmailStr
from typing import Optional, List

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

    class Config:
        from_attributes = True

class PasswordUpdate(BaseModel):
    new_password: str

# Monitor schemas
class MonitorCreate(BaseModel):
    name: str
    url: str
    method: Optional[str] = "GET"

class MonitorResponse(BaseModel):
    id: int
    name: str
    url: str
    method: str
    owner_id: int

    class Config:
        from_attributes = True