from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pipeline.agent import RokhasAgent

app = FastAPI(title="Rokhas Agent API")
agent = RokhasAgent()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionRequest(BaseModel):
    question: str
    history: list = []

class DossierRequest(BaseModel):
    type: str
    hauteur: float
    recul: float
    emprise: float
    surface_terrain: float
    zone: str = ""

@app.post("/chat")
def chat(req: QuestionRequest):
    return agent.query(req.question, req.history)

@app.post("/verify-dossier")
def verify(req: DossierRequest):
    return agent.verify_dossier(req.dict())

@app.get("/health")
def health():
    return {"status": "ok"}