"""File upload routes using S3 presigned URLs."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.deps import get_current_user_id
from app.storage.s3 import storage

router = APIRouter()


class PresignedPostRequest(BaseModel):
    filename: str | None = None
    folder: str = "uploads"


class PresignedPostResponse(BaseModel):
    url: str
    fields: dict[str, str]
    key: str


class PresignedUrlRequest(BaseModel):
    key: str
    expires_in: int = 3600


class PresignedUrlResponse(BaseModel):
    url: str | None


class DeleteRequest(BaseModel):
    key: str


@router.post("/presigned-post", response_model=PresignedPostResponse)
async def get_presigned_post(
    body: PresignedPostRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate a presigned POST URL for direct browser-to-S3 upload."""
    user_folder = f"{body.folder}/{user_id}"
    result = await storage.generate_presigned_post(
        folder=user_folder,
        filename=body.filename,
    )
    return PresignedPostResponse(
        url=result.url,
        fields=result.fields,
        key=result.fields.get("key", ""),
    )


@router.post("/presigned-url", response_model=PresignedUrlResponse)
async def get_presigned_url(
    body: PresignedUrlRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Generate a presigned URL to view/download an uploaded file."""
    url = await storage.generate_presigned_url(
        key=body.key,
        expires_in=body.expires_in,
    )
    return PresignedUrlResponse(url=url)


@router.delete("/{key:path}")
async def delete_file(
    key: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete an uploaded file."""
    success = await storage.delete(key)
    if not success:
        raise HTTPException(status_code=404, detail="File not found or delete failed")
    return {"status": "success", "message": "File deleted"}
