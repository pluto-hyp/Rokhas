from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user, get_current_admin_user
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.crud import evaluation as crud_evaluation

router = APIRouter()

@router.post("/", response_model=EvaluationResponse)
def create_evaluation(
    evaluation: EvaluationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_evaluation.create_evaluation(db=db, evaluation=evaluation, evaluator_id=current_user.id)

@router.get("/", response_model=List[EvaluationResponse])
def read_evaluations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud_evaluation.get_evaluations(db, skip=skip, limit=limit)
