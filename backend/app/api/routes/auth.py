from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ApiError
from app.db.session import get_session
from app.schemas.auth import LoginRequest, RegisterRequest, VerifyCodeRequest
from app.services.auth_service import login_user, register_user, verify_email_code

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(
    payload: RegisterRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    try:
        return await register_user(
            session,
            name=payload.name,
            email=str(payload.email),
            password=payload.password,
            role=payload.role,
            group_id=payload.group_id,
        )
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/verify-email-code")
async def verify_email(
    payload: VerifyCodeRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    try:
        return await verify_email_code(session, email=str(payload.email), code=payload.code)
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.post("/login")
async def login(
    payload: LoginRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    try:
        return await login_user(session, email=str(payload.email), password=payload.password)
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc
