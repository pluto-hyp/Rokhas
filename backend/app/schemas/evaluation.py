from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class EvaluationBase(BaseModel):
    project_ref: str
    score: float
    comments: Optional[str] = None

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationResponse(EvaluationBase):
    id: int
    evaluator_id: int
    created_at: datetime

    class Config:
        from_attributes = True
