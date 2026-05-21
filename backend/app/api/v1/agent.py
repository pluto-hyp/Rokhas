from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str

AGENT_API_URL = os.getenv("AGENT_API_URL", "http://127.0.0.1:8001/chat")
AGENT_BASE = os.getenv("AGENT_API_URL", "http://127.0.0.1:8001")


class FileAnalyzeRequest(BaseModel):
    filename: str
    preview: str = ""
    content_base64: str = ""

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a conversational message to the real AI agent (POST).
    """
    return await get_agent_response(request.message, current_user.full_name)

@router.get("/chat", response_model=ChatResponse)
async def chat_with_agent_get(
    message: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a conversational message to the real AI agent (GET).
    Query parameter: message
    """
    return await get_agent_response(message, current_user.full_name)

@router.post("/public-chat", response_model=ChatResponse)
async def public_chat_with_agent(
    request: ChatRequest
):
    """
    Send a conversational message to the real AI agent (Public).
    """
    return await get_agent_response(request.message, "Guest")

async def get_agent_response(message: str, user_name: str):
    import datetime
    import uuid
    import httpx
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(AGENT_API_URL, json={"question": message, "history": []})
            if response.ok:
                data = response.json()
                return ChatResponse(
                    id=str(uuid.uuid4())[:8],
                    role="agent",
                    content=data.get("answer", "I processed your request but have no specific answer."),
                    timestamp=datetime.datetime.now().isoformat()
                )
    except Exception as e:
        print(f"Agent API error: {e}. Falling back to simulation.")
    
    # Fallback to simulation if Agent API is down
    return simulate_agent_response(message, user_name)


@router.post("/analyze-file")
async def analyze_file(request: FileAnalyzeRequest):
    """Public endpoint: analyze a file (by filename/preview) via the Agent microservice."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            payload = {"filename": request.filename, "preview": request.preview, "content_base64": request.content_base64}
            resp = await client.post(f"{AGENT_BASE}/analyze-file", json=payload)
            if resp.ok:
                return resp.json()
    except Exception as e:
        print(f"Agent analyze-file error: {e}")

    # Fallback: simple filename heuristics
    name = request.filename or ""
    simulated = {
        "approved": True,
        "review_required": True,
        "extracted": {},
        "notes": ["Agent unavailable, accepted for manual authority review."],
        "message": "Agent unavailable. File accepted for manual authority review."
    }
    return simulated

def simulate_agent_response(message: str, user_name: str):
    import datetime
    import uuid
    
    msg = message.lower()
    if any(word in msg for word in ["hi", "hello", "bonjour", "hey"]):
        content = f"Hello {user_name}! I am the Rokhas AI Assistant (Prototype Mode). How can I help you today?"
    elif any(word in msg for word in ["permit", "construction", "request", "dossier"]):
        content = "To apply for a construction permit, you'll need to submit a topographic plan, architect designs, and proof of ownership."
    elif any(word in msg for word in ["rules", "regulation", "rgc", "height", "limit"]):
        content = "The RGC (General Construction Regulations) specifies various limits. For example, in residential zones, the maximum height is typically 12.5 meters."
    else:
        content = f"I'm currently in a limited simulation mode because the primary Agent service is offline. I understood you asked about '{message}'."
    
    return ChatResponse(
        id=str(uuid.uuid4())[:8],
        role="agent",
        content=content,
        timestamp=datetime.datetime.now().isoformat()
    )

import random
