"""Shared Pydantic schemas: response envelope, pagination, error."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel

DataT = TypeVar("DataT")


class SuccessResponse(BaseModel, Generic[DataT]):
    """JSEND success envelope."""

    status: str = "success"
    data: DataT
    meta: dict | None = None


class ErrorDetail(BaseModel):
    """JSEND error detail object."""

    code: str
    message: str
    details: dict | None = None


class ErrorResponse(BaseModel):
    """JSEND error envelope."""

    status: str = "error"
    error: ErrorDetail


class PaginationMeta(BaseModel):
    """Pagination metadata for list endpoints."""

    page: int = 1
    limit: int = 20
    total: int = 0
    cursor: str | None = None
