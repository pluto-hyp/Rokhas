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
        try:
            if self.provider == "anthropic":
                response = self.client.messages.create(
                    model="claude-3-opus-20240229",
                    max_tokens=1500,
                    system=SYSTEM_PROMPT,
                    messages=messages
                )
                answer = response.content[0].text
                
            elif self.provider == "gemini":
                try:
                    gemini_messages = []
                    for m in messages:
                        role = "user" if m["role"] == "user" else "model"
                        gemini_messages.append({"role": role, "parts": [m["content"]]})
                    response = self.gemini_model.generate_content(gemini_messages)
                    answer = response.text
                except Exception as ex:
                    print(f"Primary Gemini generation failed: {ex}. Attempting fallback...")
                    import google.generativeai as genai
                    fallback_model = genai.GenerativeModel('gemini-pro')
                    response = fallback_model.generate_content(messages[-1]["content"])
                    answer = response.text
                
            elif self.provider == "ollama":
                ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
                ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1")
                
                payload = {
                    "model": ollama_model,
                    "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + messages,
                    "stream": False
                }
                res = requests.post(f"{ollama_url}/api/chat", json=payload)
                res.raise_for_status()
                answer = res.json()["message"]["content"]
        except Exception as e:
            print(f"LLM Provider {self.provider} error: {e}. Falling back to Rule-Based RGC Evaluator.")
            answer = self.rule_based_rgc_verify(messages[-1]["content"])

        return {
            "answer": answer,
            "sources": [c["source"] for c in relevant_chunks] if relevant_chunks else [],
            "chunks_used": relevant_chunks if relevant_chunks else []
        }

    def rule_based_rgc_verify(self, question: str) -> str:
        import re
        
        type_const = "Non spécifié"
        hauteur = 0.0
        recul = 0.0
        emprise = 0.0
        surface_terrain = 0.0
        zone = "Zone Urbaine"
        
        type_match = re.search(r"Type de construction\s*:\s*(.*)", question, re.IGNORECASE)
        hauteur_match = re.search(r"Hauteur\s*:\s*([\d\.]+)", question, re.IGNORECASE)
        recul_match = re.search(r"Recul par rapport à la voie publique\s*:\s*([\d\.]+)", question, re.IGNORECASE)
        emprise_match = re.search(r"Emprise au sol\s*:\s*([\d\.]+)", question, re.IGNORECASE)
        surface_match = re.search(r"Surface terrain\s*:\s*([\d\.]+)", question, re.IGNORECASE)
        zone_match = re.search(r"Zone\s*:\s*(.*)", question, re.IGNORECASE)
        
        if type_match: type_const = type_match.group(1).strip()
        if hauteur_match: hauteur = float(hauteur_match.group(1))
        if recul_match: recul = float(recul_match.group(1))
        if emprise_match: emprise = float(emprise_match.group(1))
        if surface_match: surface_terrain = float(surface_match.group(1))
        if zone_match: zone = zone_match.group(1).strip()
        
        max_hauteur = 12.0
        min_recul = 3.0
        max_emprise = 65.0
        
        zone_lower = zone.lower()
        if "r2" in zone_lower:
            max_hauteur = 8.5
            max_emprise = 60.0
        elif "r3" in zone_lower:
            max_hauteur = 11.5
            max_emprise = 70.0
        elif "r4" in zone_lower:
            max_hauteur = 14.5
            max_emprise = 70.0
            
        conformity_details = []
        non_conformity_details = []
        
        if hauteur <= max_hauteur:
            conformity_details.append(f"Hauteur de {hauteur} m est CONFORME (Limite max autorisée pour la zone {zone} : {max_hauteur} m).")
        else:
            non_conformity_details.append(f"Hauteur non-conforme : {hauteur} m dépasse la limite réglementaire de la zone {zone} ({max_hauteur} m).")
            
        if recul >= min_recul:
            conformity_details.append(f"Recul par rapport à la voie publique de {recul} m est CONFORME (Minimum requis : {min_recul} m).")
        else:
            non_conformity_details.append(f"Recul non-conforme : {recul} m est inférieur au recul minimal requis de {min_recul} m (RGC Article 24).")
            
        if emprise <= max_emprise:
            conformity_details.append(f"Emprise au sol de {emprise}% est CONFORME (Limite max autorisée pour la zone {zone} : {max_emprise}%).")
        else:
            non_conformity_details.append(f"Emprise au sol non-conforme : {emprise}% dépasse le coefficient maximum autorisé pour la zone {zone} ({max_emprise}%).")
            
        report = []
        report.append("### 📋 Rapport d'Évaluation Réglementaire RGC Marocain (AI Agent)")
        report.append(f"**Analyse de conformité automatisée pour : {type_const}**")
        report.append(f"- **Zone d'aménagement :** {zone}")
        report.append(f"- **Surface terrain déclarée :** {surface_terrain} m²")
        report.append("")
        
        report.append("#### ✅ Éléments de Conformité Valides")
        if conformity_details:
            for item in conformity_details:
                report.append(f"- {item}")
        else:
            report.append("- Aucun élément conforme détecté.")
        report.append("")
        
        report.append("#### ⚠️ Anomalies et Non-Conformités Détectées")
        if non_conformity_details:
            for item in non_conformity_details:
                report.append(f"- {item}")
        else:
            report.append("- Félicitations ! Aucun écart par rapport au Règlement Général de Construction n'a été détecté.")
        report.append("")
        
        report.append("#### 📂 Pièces Administratives Recommandées")
        report.append("1. **Plan de situation** à l'échelle 1/2000ème.")
        report.append("2. **Certificat de propriété récent** délivré par la Conservation Foncière (ANCFCC).")
        report.append("3. **Plan de masse** signé par l'architecte du projet.")
        report.append("4. **Plans de coupes et de façades** détaillant les hauteurs déclarées.")
        
        return "\n".join(report)

    def analyze_file(self, filename: str, content_preview: str = "") -> dict:
        """
        Lightweight file analysis based on filename patterns and optional preview text.
        Returns a dict with approval status, extracted metadata, and notes.
        """
        import re

        extracted = {
            "citizen_cin": None,
            "land_reference": None,
            "surface_terrain": None,
            "owner_name": None,
        }

        name = filename or ""
        # CIN like AB123456 or A12345
        cin_match = re.search(r"\b([A-Z]{1,2}\d{5,6})\b", name, re.IGNORECASE)
        if cin_match:
            extracted["citizen_cin"] = cin_match.group(1).upper()

        # Land ref like 54932/45
        land_match = re.search(r"\b(\d{4,6}\/\d{2})\b", name)
        if land_match:
            extracted["land_reference"] = f"Titre Foncier {land_match.group(1)}"

        # Surface like 120m2 or 250 m2
        surface_match = re.search(r"\b(\d{2,4})\s*(m2|sqm|meters)\b", name, re.IGNORECASE)
        if surface_match:
            try:
                extracted["surface_terrain"] = int(surface_match.group(1))
            except Exception:
                pass

        # Owner name patterns: by_name or owner_name
        name_match = re.search(r"(?:by|owner|client)_([a-zA-Z]+(?:_[a-zA-Z]+)+)", name, re.IGNORECASE)
        if name_match:
            parsed = name_match.group(1).replace("_", " ")
            extracted["owner_name"] = " ".join([p.capitalize() for p in parsed.split()])

        # Also try to scan preview text for keywords
        # If content_preview is a data URL or base64 blob, attempt OCR (images) or text extraction
        preview = content_preview or ""
        try:
            if preview and (preview.startswith("data:") or len(preview) > 200):
                import base64, io
                try:
                    from PIL import Image
                    import pytesseract
                    # Extract base64 payload
                    b64 = preview.split(",", 1)[1] if preview.startswith("data:") else preview
                    img_bytes = base64.b64decode(b64)
                    img = Image.open(io.BytesIO(img_bytes))
                    try:
                        # Try French language first, fallback to default
                        text_from_image = pytesseract.image_to_string(img, lang='fra')
                    except Exception:
                        text_from_image = pytesseract.image_to_string(img)
                    # append OCR text to preview for additional pattern matching
                    preview = (preview + "\n" + text_from_image) if preview else text_from_image
                except Exception:
                    # If PIL/pytesseract not available or image parsing fails, leave preview as-is
                    preview = content_preview
        except Exception:
            preview = content_preview
        if not extracted["citizen_cin"]:
            cin_match2 = re.search(r"\b([A-Z]{1,2}\d{5,6})\b", preview, re.IGNORECASE)
            if cin_match2:
                extracted["citizen_cin"] = cin_match2.group(1).upper()

        notes = []
        # Basic approval rules: require at least land_reference and owner_name
        if extracted["land_reference"]:
            notes.append("Land reference detected.")
        else:
            notes.append("Missing land reference (Titre Foncier) in filename or preview.")

        if extracted["owner_name"] or extracted["citizen_cin"]:
            notes.append("Owner identity present or CIN detected.")
        else:
            notes.append("Missing owner identification (name or CIN).")

        approved = bool(extracted["land_reference"] and (extracted["owner_name"] or extracted["citizen_cin"]))

        message = "Fichier analysé par l'agent local."
        if approved:
            message += " Pièce jugée conforme pour l'instant (vérification initiale)."
        else:
            message += " Pièce incomplète ou ambiguë — vérification humaine requise."

        return {
            "approved": approved,
            "extracted": extracted,
            "notes": notes,
            "message": message,
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