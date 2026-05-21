import os
from pathlib import Path
import chromadb
from .ingest import chunk_documents, extract_text_from_pdf

# Multilingual model for Arabic, French, and English.
EMBED_MODEL = os.getenv(
    "EMBED_MODEL",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)


def resolve_local_model_path(model_name: str) -> str:
    configured_path = os.getenv("EMBED_MODEL_PATH")
    if configured_path:
        return configured_path

    cache_name = f"models--{model_name.replace('/', '--')}"
    cache_root = Path(os.getenv("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub" / cache_name
    refs_main = cache_root / "refs" / "main"
    snapshots_dir = cache_root / "snapshots"

    if refs_main.exists():
        revision = refs_main.read_text(encoding="utf-8").strip()
        snapshot = snapshots_dir / revision
        if snapshot.exists():
            return str(snapshot)

    if snapshots_dir.exists():
        snapshots = [path for path in snapshots_dir.iterdir() if path.is_dir()]
        if snapshots:
            return str(snapshots[0])

    return model_name


class TransformersEmbedder:
    def __init__(self, model_name: str):
        import torch
        from transformers import AutoModel, AutoTokenizer

        self.torch = torch
        self.model_path = resolve_local_model_path(model_name)
        use_local_only = Path(self.model_path).exists()
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_path, local_files_only=use_local_only)
        self.model = AutoModel.from_pretrained(self.model_path, local_files_only=use_local_only)
        self.model.eval()

    def encode(self, texts: list[str], show_progress_bar: bool = False):
        del show_progress_bar
        if isinstance(texts, str):
            texts = [texts]

        with self.torch.no_grad():
            batch = self.tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
            output = self.model(**batch)
            mask = batch["attention_mask"].unsqueeze(-1).float()
            embeddings = (output.last_hidden_state * mask).sum(dim=1) / mask.sum(dim=1).clamp(min=1e-9)
            return embeddings.cpu().numpy()


class VectorStore:
    def __init__(self, persist_dir: str = "data/chroma_db"):
        if not Path(persist_dir).is_absolute():
            persist_dir = str(Path(__file__).resolve().parents[1] / persist_dir)

        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name="rokhas_reglements",
            metadata={"hnsw:space": "cosine"},
        )
        self.embedder = TransformersEmbedder(EMBED_MODEL)

    def add_chunks(self, chunks: list[dict], batch_size: int = 64):
        for start in range(0, len(chunks), batch_size):
            batch_chunks = chunks[start:start + batch_size]
            contents = [c["content"] for c in batch_chunks]
            embeddings = self.embedder.encode(contents, show_progress_bar=True).tolist()

            self.collection.upsert(
                documents=contents,
                embeddings=embeddings,
                metadatas=[{"source": c["source"], "chunk_id": c["chunk_id"]} for c in batch_chunks],
                ids=[f"{c['source']}_{c['chunk_id']}" for c in batch_chunks],
            )
            print(f"Stored chunks {start + len(batch_chunks)}/{len(chunks)} in ChromaDB")

    def search(self, query: str, n_results: int = 5) -> list[dict]:
        query_embedding = self.embedder.encode([query]).tolist()
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results,
        )
        return [
            {
                "content": doc,
                "source": meta["source"],
                "chunk_id": meta["chunk_id"],
            }
            for doc, meta in zip(
                results["documents"][0],
                results["metadatas"][0],
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
