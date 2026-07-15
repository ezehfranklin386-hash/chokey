"""KYC schemas."""

from __future__ import annotations

from pydantic import BaseModel


class SubmitKycRequest(BaseModel):
    document_type: str  # passport, drivers_license, national_id, proof_of_address, selfie
    file_data: str  # base64 encoded file content
    file_name: str
    metadata: dict | None = None


class KycDocumentResponse(BaseModel):
    id: str
    document_type: str
    status: str
    rejection_reason: str | None
    created_at: str
    updated_at: str


class KycStatusResponse(BaseModel):
    kyc_level: str
    status: str  # not_submitted, pending, approved, rejected
    documents: list[KycDocumentResponse]
