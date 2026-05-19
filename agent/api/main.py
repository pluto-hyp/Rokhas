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


@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Rokhas Agent API is running",
        "endpoints": ["/health", "/chat", "/verify-dossier", "/analyze-file", "/docs", "/redoc"]
    }

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


class FileAnalyzeRequest(BaseModel):
    filename: str
    preview: str = ""
    content_base64: str = ""

@app.post("/chat")
def chat(req: QuestionRequest):
    return agent.query(req.question, req.history)

@app.post("/verify-dossier")
def verify(req: DossierRequest):
    return agent.verify_dossier(req.dict())


@app.post("/analyze-file")
def analyze_file(req: FileAnalyzeRequest):
    # prefer content_base64 if provided (image/text preview)
    preview = req.content_base64 or req.preview
    return agent.analyze_file(req.filename, preview)

@app.get("/health")
def health():
    return {"status": "ok"}