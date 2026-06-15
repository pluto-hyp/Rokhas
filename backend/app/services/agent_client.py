import httpx
import os
from typing import Dict, Any

AGENT_URL = os.getenv("AGENT_URL", "http://127.0.0.1:8001")

async def verify_dossier_with_agent(dossier_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends the dossier properties to the Rokhas AI agent microservice
    to verify compliance with the RGC (Règlement Général de Construction).
    """
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "type": dossier_data.get("type", "Non spécifié"),
                "hauteur": float(dossier_data.get("hauteur") or 0.0),
                "recul": float(dossier_data.get("recul") or 0.0),
                "emprise": float(dossier_data.get("emprise") or 0.0),
                "surface_terrain": float(dossier_data.get("surface_terrain") or 0.0),
                "zone": dossier_data.get("zone", "Non spécifié")
            }
            response = await client.post(f"{AGENT_URL}/verify-dossier", json=payload, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            return {"answer": f"Erreur de connexion à l'agent IA : {exc}", "sources": []}
        except Exception as exc:
            return {"answer": f"Erreur inattendue : {exc}", "sources": []}

async def verify_business_permit_with_agent(permit_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sends the business permit properties to the Rokhas AI agent microservice
    to verify compliance for economic requests.
    """
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "business_name": permit_data.get("business_name", "Non spécifié"),
                "business_type": permit_data.get("business_type", "Non spécifié"),
                "business_description": permit_data.get("business_description", ""),
                "address": permit_data.get("address", ""),
                "zone": permit_data.get("zone", "Non spécifié"),
                "surface_area": permit_data.get("surface_area"),
                "permit_documents": permit_data.get("permit_documents", [])
            }
            response = await client.post(f"{AGENT_URL}/verify-business-permit", json=payload, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as exc:
            return {"answer": f"Erreur de connexion à l'agent IA : {exc}", "sources": []}
        except Exception as exc:
            return {"answer": f"Erreur inattendue : {exc}", "sources": []}
