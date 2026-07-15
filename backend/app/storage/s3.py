"""S3 file storage service with presigned URL support.

Uses sync boto3 client wrapped in asyncio.to_thread for non-blocking I/O.
"""

from __future__ import annotations

import asyncio
import mimetypes
import uuid
from dataclasses import dataclass
from pathlib import PurePosixPath
from typing import BinaryIO

import boto3
import structlog
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError

from app.config import settings

logger = structlog.get_logger()

S3_MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
S3_URL_EXPIRY = 3600  # 1 hour


@dataclass
class S3UploadResult:
    key: str
    url: str
    bucket: str
    etag: str | None = None


@dataclass
class S3PresignedPost:
    url: str
    fields: dict[str, str]


class S3Storage:
    """S3 abstraction using sync boto3 wrapped in threads for async use."""

    def __init__(self) -> None:
        self._client = None
        self._bucket: str = ""
        self._region: str = ""
        self._enabled = False

    def _build_client(self) -> None:
        self._bucket = settings.s3_bucket
        self._region = settings.s3_region or "us-east-1"
        self._enabled = bool(self._bucket and settings.aws_access_key_id)

        if not self._enabled:
            logger.warning("S3 not configured — file uploads disabled")
            return

        session = boto3.Session(
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key.get_secret_value()
            if settings.aws_secret_access_key
            else None,
            region_name=self._region,
        )
        self._client = session.client(
            "s3",
            config=BotoConfig(
                retries={"max_attempts": 3, "mode": "adaptive"},
                connect_timeout=10,
                read_timeout=30,
            ),
        )
        logger.info("S3 storage initialized", bucket=self._bucket, region=self._region)

    async def initialize(self) -> None:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._build_client)

    async def upload(
        self,
        file: BinaryIO,
        folder: str = "uploads",
        filename: str | None = None,
        content_type: str | None = None,
        metadata: dict | None = None,
    ) -> S3UploadResult:
        if not self._enabled or self._client is None:
            raise RuntimeError("S3 storage is not configured")

        ext = PurePosixPath(filename or "file").suffix
        key = f"{folder}/{uuid.uuid4().hex}{ext}"
        content_type = content_type or mimetypes.guess_type(filename or "")[0] or "application/octet-stream"

        extra = {"ContentType": content_type}
        if metadata:
            extra["Metadata"] = {k: str(v) for k, v in metadata.items()}

        def _do_upload():
            try:
                resp = self._client.put_object(
                    Bucket=self._bucket,
                    Key=key,
                    Body=file,
                    **extra,
                )
                url = f"https://{self._bucket}.s3.{self._region}.amazonaws.com/{key}"
                return S3UploadResult(
                    key=key, url=url, bucket=self._bucket, etag=resp.get("ETag")
                )
            except ClientError as exc:
                logger.error("S3 upload failed", key=key, error=str(exc))
                raise

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _do_upload)

    async def delete(self, key: str) -> bool:
        if not self._enabled or self._client is None:
            return False

        def _do_delete():
            try:
                self._client.delete_object(Bucket=self._bucket, Key=key)
                return True
            except ClientError as exc:
                logger.error("S3 delete failed", key=key, error=str(exc))
                return False

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _do_delete)

    async def generate_presigned_url(
        self,
        key: str,
        expires_in: int = S3_URL_EXPIRY,
        method: str = "get_object",
    ) -> str | None:
        if not self._enabled or self._client is None:
            return None

        def _do_presign():
            try:
                return self._client.generate_presigned_url(
                    ClientMethod=method,
                    Params={"Bucket": self._bucket, "Key": key},
                    ExpiresIn=expires_in,
                )
            except ClientError as exc:
                logger.error("S3 presigned URL failed", key=key, error=str(exc))
                return None

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _do_presign)

    async def generate_presigned_post(
        self,
        folder: str = "uploads",
        filename: str | None = None,
        expires_in: int = S3_URL_EXPIRY,
        max_size: int = S3_MAX_FILE_SIZE,
    ) -> S3PresignedPost:
        if not self._enabled or self._client is None:
            raise RuntimeError("S3 storage is not configured")

        ext = PurePosixPath(filename or "file").suffix
        key = f"{folder}/{uuid.uuid4().hex}{ext}"
        conditions = [
            {"bucket": self._bucket},
            {"key": key},
            ["content-length-range", 1, max_size],
        ]

        def _do_presign_post():
            try:
                resp = self._client.generate_presigned_post(
                    Bucket=self._bucket,
                    Key=key,
                    Conditions=conditions,
                    ExpiresIn=expires_in,
                )
                return S3PresignedPost(url=resp["url"], fields=resp["fields"])
            except ClientError as exc:
                logger.error("S3 presigned POST failed", key=key, error=str(exc))
                raise

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _do_presign_post)


storage = S3Storage()
