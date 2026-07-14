import os
import time
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()
CHUNK_SIZE = 1024 * 256

@router.get("/ping")
async def ping():
    return {"ok": True, "ts": time.time()}

@router.get("/download")
async def download(bytes: int = 5 * 1024 * 1024):
    def generate():
        remaining = bytes
        while remaining > 0:
            chunk = os.urandom(min(CHUNK_SIZE, remaining))
            remaining -= len(chunk)
            yield chunk
    headers = {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "Content-Disposition": 'inline; filename="download.bin"'
    }
    return StreamingResponse(generate(), media_type="application/octet-stream", headers=headers)

@router.post("/upload")
async def upload(request: Request):
    total = 0
    async for chunk in request.stream():
        total += len(chunk)
    return JSONResponse({"received_bytes": total, "ok": True})
