"""
Vercel Blob Storage service.
Uploads files to Vercel Blob via the REST API and returns public URLs.
Falls back to local disk storage if BLOB_READ_WRITE_TOKEN is not configured.
"""

import os
import mimetypes
from pathlib import Path
from typing import Optional

BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN", "")
VERCEL_BLOB_API_URL = "https://blob.vercel-storage.com"


def is_blob_enabled() -> bool:
    """Check if Vercel Blob Storage is configured."""
    return bool(BLOB_READ_WRITE_TOKEN)


def is_blob_url(url: str) -> bool:
    """Check if a URL points to Vercel Blob Storage."""
    return "blob.vercel-storage.com" in url


async def upload_to_blob(
    file_bytes: bytes,
    pathname: str,
    content_type: Optional[str] = None,
) -> dict:
    """
    Upload a file to Vercel Blob Storage.

    Args:
        file_bytes: Raw file bytes to upload.
        pathname: The desired path/name in the blob store (e.g. 'dossiers/42/plan.pdf').
        content_type: Optional MIME type. Auto-detected from pathname if not provided.

    Returns:
        A dict with 'url' (the public blob URL), 'pathname', and 'size'.

    Raises:
        RuntimeError if the upload fails.
    """
    import httpx

    if not content_type:
        content_type, _ = mimetypes.guess_type(pathname)
        if not content_type:
            content_type = "application/octet-stream"

    headers = {
        "Authorization": f"Bearer {BLOB_READ_WRITE_TOKEN}",
        "x-api-version": "1",
        "Content-Type": content_type,
    }

    url = f"{VERCEL_BLOB_API_URL}/{pathname}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.put(url, content=file_bytes, headers=headers)

    if response.status_code not in (200, 201):
        raise RuntimeError(
            f"Vercel Blob upload failed: {response.status_code} {response.text}"
        )

    data = response.json()
    return {
        "url": data["url"],
        "pathname": data.get("pathname", pathname),
        "size": data.get("size", len(file_bytes)),
    }


async def delete_from_blob(blob_url: str) -> bool:
    """
    Delete a file from Vercel Blob Storage by its public URL.
    Returns True on success, False on failure.
    """
    import httpx

    headers = {
        "Authorization": f"Bearer {BLOB_READ_WRITE_TOKEN}",
        "x-api-version": "1",
        "Content-Type": "application/json",
    }

    delete_api_url = "https://blob.vercel-storage.com/delete"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            delete_api_url,
            json={"urls": [blob_url]},
            headers=headers,
        )

    return response.status_code in (200, 204)
