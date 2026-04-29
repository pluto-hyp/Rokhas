from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, get_current_active_user
from app.models.user import User
from pydantic import BaseModel
import httpx

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str

AGENT_API_URL = "http://localhost:8001/chat"

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a conversational message to the real AI agent.
    """
    return await get_agent_response(request.message, current_user.full_name)

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
