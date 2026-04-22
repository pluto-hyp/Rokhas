import os
import requests
from dotenv import load_dotenv
from .vectorstore import VectorStore

load_dotenv()

SYSTEM_PROMPT = """Tu es un assistant expert en urbanisme marocain, 
spécialisé dans le Règlement Général de Construction (RGC) 
et les plans d'aménagement des communes urbaines du Maroc.

Ton rôle :
1. Répondre aux questions des citoyens sur les permis de construire
2. Vérifier la conformité d'un projet avec la réglementation
3. Lister les pièces manquantes dans un dossier
4. Toujours citer l'article ou la source sur laquelle tu te bases

Règles importantes :
- Si tu n'as pas l'info dans le contexte fourni, dis-le clairement
- Réponds en français (ou en arabe si la question est en arabe)
- Sois précis et cite les articles exacts
"""

class RokhasAgent:
    def __init__(self):
        self.store = VectorStore()
        
        # Options: "ollama", "gemini"
        self.provider = os.getenv("LLM_PROVIDER", "ollama").lower()

        if self.provider == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=SYSTEM_PROMPT)

    def query(self, question: str, conversation_history: list = []) -> dict:
        relevant_chunks = self.store.search(question, n_results=5)

        context = "\n\n---\n\n".join([
            f"[Source: {c['source']}]\n{c['content']}"
            for c in relevant_chunks
        ])
        user_message = f"""Contexte réglementaire pertinent :
{context}

---

Question : {question}"""

        messages = conversation_history + [
            {"role": "user", "content": user_message}
        ]

        answer = ""
        
        if self.provider == "anthropic":
            response = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1500,
                system=SYSTEM_PROMPT,
                messages=messages
            )
            answer = response.content[0].text
            
        elif self.provider == "gemini":
            gemini_messages = []
            for m in messages:
                role = "user" if m["role"] == "user" else "model"
                gemini_messages.append({"role": role, "parts": [m["content"]]})
            response = self.gemini_model.generate_content(gemini_messages)
            answer = response.text
            
        elif self.provider == "ollama":
            ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1")
            
            payload = {
                "model": ollama_model,
                "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
                "stream": False
            }
            try:
                res = requests.post(f"{ollama_url}/api/chat", json=payload)
                res.raise_for_status()
                answer = res.json()["message"]["content"]
            except requests.exceptions.ConnectionError:
                answer = "Erreur : Impossible de se connecter à Ollama. Veuillez vérifier que l'application Ollama est installée et lancée (http://localhost:11434)."
            except Exception as e:
                answer = f"Erreur inattendue avec Ollama : {e}"

        return {
            "answer": answer,
            "sources": [c["source"] for c in relevant_chunks],
            "chunks_used": relevant_chunks
        }

    def verify_dossier(self, dossier_info: dict) -> dict:
        """Vérifie la conformité d'un dossier de permis de construire"""
        question = f"""
Vérifie la conformité de ce projet avec le RGC :
- Type de construction : {dossier_info.get('type')}
- Hauteur : {dossier_info.get('hauteur')} m
- Recul par rapport à la voie publique : {dossier_info.get('recul')} m
- Emprise au sol : {dossier_info.get('emprise')}%
- Surface terrain : {dossier_info.get('surface_terrain')} m²
- Zone : {dossier_info.get('zone', 'non spécifiée')}

Liste les points conformes, les non-conformités, et les pièces manquantes.
"""
        return self.query(question)


if __name__ == "__main__":
    agent = RokhasAgent()

    result = agent.query("Quelle est la hauteur maximale autorisée en zone résidentielle ?")
    print("Réponse :", result["answer"])
    print("Sources :", result["sources"])

    dossier = {
        "type": "Villa individuelle",
        "hauteur": 9.5,
        "recul": 3,
        "emprise": 65,
        "surface_terrain": 250,
        "zone": "R2"
    }
    result2 = agent.verify_dossier(dossier)
    print("\nAnalyse dossier :", result2["answer"])