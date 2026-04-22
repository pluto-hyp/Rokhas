import anthropic
import os
from dotenv import load_dotenv
from vectorstore import VectorStore

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
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.store = VectorStore()

    def query(self, question: str, conversation_history: list = []) -> dict:
        # 1. Retrieval — chercher les chunks pertinents
        relevant_chunks = self.store.search(question, n_results=5)

        # 2. Construire le contexte
        context = "\n\n---\n\n".join([
            f"[Source: {c['source']}]\n{c['content']}"
            for c in relevant_chunks
        ])

        # 3. Construire le message avec contexte
        user_message = f"""Contexte réglementaire pertinent :
{context}

---

Question : {question}"""

        messages = conversation_history + [
            {"role": "user", "content": user_message}
        ]

        # 4. Appel LLM
        response = self.client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=messages
        )

        answer = response.content[0].text

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

    # Test 1 — question simple
    result = agent.query("Quelle est la hauteur maximale autorisée en zone résidentielle ?")
    print("Réponse :", result["answer"])
    print("Sources :", result["sources"])

    # Test 2 — vérification dossier
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