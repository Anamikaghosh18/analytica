from pydantic import BaseModel
from typing import Optional

class MonitorCreate(BaseModel):
    name: str
    url: str
    method: Optional[str] = "GET"

class MonitorResponse(BaseModel):
    id: int
    name: str
    url: str
    method: str

    class Config:
        from_attributes = True