import fitz  # PyMuPDF
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pathlib import Path

def extract_text_from_pdf(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text

def chunk_documents(text: str, source_name: str) -> list[dict]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\nArticle", "\nChapitre", "\n\n", "\n", " "]
    )
    chunks = splitter.split_text(text)
    return [
        {"content": chunk, "source": source_name, "chunk_id": i}
        for i, chunk in enumerate(chunks)
    ]

if __name__ == "__main__":
    docs_dir = Path("data/reglements")
    all_chunks = []

    for pdf_file in docs_dir.glob("*.pdf"):
        print(f"Traitement : {pdf_file.name}")
        text = extract_text_from_pdf(str(pdf_file))
        chunks = chunk_documents(text, pdf_file.name)
        all_chunks.extend(chunks)
        print(f"  → {len(chunks)} chunks générés")

    print(f"\nTotal : {len(all_chunks)} chunks prêts pour vectorisation")