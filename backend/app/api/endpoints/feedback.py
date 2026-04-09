from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import models, schemas
from app.api.deps import get_db

router = APIRouter()

@router.post("/", response_model=dict)
def submit_feedback(
    feedback_in: schemas.FeedbackCreate,
    db: Session = Depends(get_db)
):
    """
    Store feedback from the landing page.
    """
    db_feedback = models.Feedback(
        email=feedback_in.email,
        message=feedback_in.message
    )
    db.add(db_feedback)
    db.commit()
    return {"status": "success", "message": "Feedback stored"}
