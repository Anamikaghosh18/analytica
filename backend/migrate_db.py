from app.database import engine
from sqlalchemy import text, inspect
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate():
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        # 1. Update api_monitors table
        columns = [c['name'] for c in inspector.get_columns('api_monitors')]
        if 'check_interval_seconds' not in columns:
            logger.info("Adding check_interval_seconds to api_monitors")
            conn.execute(text("ALTER TABLE api_monitors ADD COLUMN check_interval_seconds INTEGER DEFAULT 60"))
        
        if 'last_checked' not in columns:
            logger.info("Adding last_checked to api_monitors")
            conn.execute(text("ALTER TABLE api_monitors ADD COLUMN last_checked TIMESTAMP"))

        if 'headers' not in columns:
            logger.info("Adding headers to api_monitors")
            conn.execute(text("ALTER TABLE api_monitors ADD COLUMN headers TEXT"))

        if 'is_public' not in columns:
            logger.info("Adding is_public to api_monitors")
            conn.execute(text("ALTER TABLE api_monitors ADD COLUMN is_public BOOLEAN DEFAULT FALSE"))

        # 2. Update api_checks table
        columns = [c['name'] for c in inspector.get_columns('api_checks')]
        if 'node_id' not in columns:
            logger.info("Adding node_id to api_checks")
            conn.execute(text("ALTER TABLE api_checks ADD COLUMN node_id INTEGER REFERENCES monitoring_nodes(id)"))

        conn.commit()
        logger.info("Migration complete successfully.")

if __name__ == "__main__":
    migrate()
