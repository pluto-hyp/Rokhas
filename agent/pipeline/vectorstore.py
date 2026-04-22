import chromadb
from sentence_transformers import SentenceTransformer
from .ingest import extract_text_from_pdf, chunk_documents
from pathlib import Path

# Modèle multilingue — supporte l'arabe, le français et l'anglais
EMBED_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"

class VectorStore:
    def __init__(self, persist_dir: str = "data/chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name="rokhas_reglements",
            metadata={"hnsw:space": "cosine"}
        )
        self.embedder = SentenceTransformer(EMBED_MODEL)

    def add_chunks(self, chunks: list[dict]):
        contents = [c["content"] for c in chunks]
        embeddings = self.embedder.encode(contents, show_progress_bar=True).tolist()

        self.collection.add(
            documents=contents,
            embeddings=embeddings,
            metadatas=[{"source": c["source"], "chunk_id": c["chunk_id"]} for c in chunks],
            ids=[f"{c['source']}_{c['chunk_id']}" for c in chunks]
        )
        print(f"{len(chunks)} chunks stockés dans ChromaDB")

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        query_embedding = self.embedder.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        return [
            {
                "content": doc,
                "source": meta["source"],
                "chunk_id": meta["chunk_id"]
            }
            for doc, meta in zip(
                results["documents"][0],
                results["metadatas"][0]
            )
        ]

if __name__ == "__main__":
    store = VectorStore()
    all_chunks = []
    for pdf_file in Path("data/reglements").glob("*.pdf"):
        text = extract_text_from_pdf(str(pdf_file))
        chunks = chunk_documents(text, pdf_file.name)
        all_chunks.extend(chunks)
    store.add_chunks(all_chunks)