from sqlalchemy.orm import Session
from app.models.evaluation import Evaluation
from app.schemas.evaluation import EvaluationCreate

def get_evaluation(db: Session, evaluation_id: int):
    return db.query(Evaluation).filter(Evaluation.id == evaluation_id).first()

def get_evaluations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Evaluation).offset(skip).limit(limit).all()

def create_evaluation(db: Session, evaluation: EvaluationCreate, evaluator_id: int):
    db_evaluation = Evaluation(**evaluation.model_dump(), evaluator_id=evaluator_id)
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation
