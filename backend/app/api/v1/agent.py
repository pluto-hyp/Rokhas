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

AGENT_URL = "http://localhost:8000"

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a conversational message to the AI agent.
    """
    try:
        # In a real scenario, this hits the external agent microservice
        # async with httpx.AsyncClient() as client:
        #     response = await client.post(f"{AGENT_URL}/chat", json={"message": request.message})
        #     response.raise_for_status()
        #     data = response.json()
        
        # For this prototype, we'll return a simulated response if the agent is not running
        import datetime
        import uuid
        
        return ChatResponse(
            id=str(uuid.uuid4())[:8],
            role="agent",
            content=f"Received via backend: '{request.message}'. I am the backend-connected Rokhas Agent.",
            timestamp=datetime.datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent communication failed: {str(e)}")
