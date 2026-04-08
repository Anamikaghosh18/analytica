from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool, QueuePool
from typing import Generator
import os
from .config import settings


def create_db_engine():
    if settings.environment == "production":
        pool_class = NullPool  
        pool_size = None
        max_overflow = None
    else:
        pool_class = QueuePool
        pool_size = 10
        max_overflow = 20
    
    engine_kwargs = {
        "poolclass": pool_class,
        "pool_pre_ping": True, 
        "pool_recycle": 3600,   
        "echo": False,          
    }
    
    if pool_size:
        engine_kwargs["pool_size"] = pool_size
        engine_kwargs["max_overflow"] = max_overflow
    
   
    if settings.environment == "production":
        
        if settings.database_url and "postgres.railway" not in settings.database_url:  
            engine_kwargs["connect_args"] = {
                "sslmode": "require"
            }
    
    engine = create_engine(
        settings.get_database_url(),
        **engine_kwargs
    )
    
    return engine


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()

# Helper function to check database health
def check_db_health() -> dict:
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "healthy", "message": "Database connected"}
    except Exception as e:
        return {"status": "unhealthy", "message": str(e)}