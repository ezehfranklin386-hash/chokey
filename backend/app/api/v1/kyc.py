"""KYC routes: document submission, status, history."""

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_id

router = APIRouter()


@router.post("/submit", status_code=201)
async def submit_kyc(user_id: str = Depends(get_current_user_id)):
    """Submit a KYC document."""
    return {"status": "success", "data": {"message": "Document submitted.", "id": "doc_id"}}


@router.get("/status")
async def get_kyc_status(user_id: str = Depends(get_current_user_id)):
    """Get current KYC level and pending submissions."""
    return {
        "status": "success",
        "data": {"kyc_level": "NONE", "status": "not_submitted", "documents": []},
    }


@router.get("/documents")
async def list_kyc_documents(user_id: str = Depends(get_current_user_id)):
    """List submitted KYC documents."""
    return {"status": "success", "data": {"documents": []}}
