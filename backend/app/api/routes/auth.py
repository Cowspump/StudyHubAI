from fastapi import APIRouter, HTTPException

from app.core.exceptions import ApiError
from app.schemas.auth import LoginRequest, RegisterRequest, VerifyCodeRequest
from app.services.auth_service import login_user, register_user, verify_email_code

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(payload: RegisterRequest) -> dict:
    try:
        return register_user(
            name=payload.name,
            email=str(payload.email),
            password=payload.password,
            role=payload.role,
            group_id=payload.groupId,
        )
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/verify-email-code")
def verify_email(payload: VerifyCodeRequest) -> dict:
    try:
        return verify_email_code(email=str(payload.email), code=payload.code)
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/login")
def login(payload: LoginRequest) -> dict:
    try:
        return login_user(email=str(payload.email), password=payload.password)
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
