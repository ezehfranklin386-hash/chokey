"""KYC business logic."""

from __future__ import annotations


class KycService:
    @staticmethod
    async def submit_document(user_id: str, document_type: str, file_data: str, file_name: str) -> dict:
        raise NotImplementedError

    @staticmethod
    async def get_status(user_id: str) -> dict:
        raise NotImplementedError

    @staticmethod
    async def list_documents(user_id: str) -> list:
        raise NotImplementedError

    @staticmethod
    async def approve_document(doc_id: str, admin_id: str) -> None:
        raise NotImplementedError

    @staticmethod
    async def reject_document(doc_id: str, admin_id: str, reason: str) -> None:
        raise NotImplementedError


kyc_service = KycService()
