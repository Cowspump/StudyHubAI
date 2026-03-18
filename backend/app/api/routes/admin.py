from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import require_role
from app.core.exceptions import ApiError
from app.db.session import get_session
from app.schemas.admin import TeacherCreateRequest, TeacherUpdateRequest
from app.services import admin_service

router = APIRouter(prefix="/api/admin", tags=["admin"])

superadmin = require_role("superadmin")


@router.get("/teachers")
async def list_teachers(
    session: AsyncSession = Depends(get_session),
    _user: dict = Depends(superadmin),
) -> list[dict]:
    return await admin_service.list_teachers(session)


@router.post("/teachers", status_code=201)
async def create_teacher(
    payload: TeacherCreateRequest,
    session: AsyncSession = Depends(get_session),
    _user: dict = Depends(superadmin),
) -> dict:
    try:
        return await admin_service.create_teacher(
            session, name=payload.name, email=str(payload.email), password=payload.password
        )
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.put("/teachers/{teacher_id}")
async def update_teacher(
    teacher_id: int,
    payload: TeacherUpdateRequest,
    session: AsyncSession = Depends(get_session),
    _user: dict = Depends(superadmin),
) -> dict:
    try:
        return await admin_service.update_teacher(
            session,
            teacher_id=teacher_id,
            name=payload.name,
            email=str(payload.email) if payload.email else None,
        )
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.delete("/teachers/{teacher_id}", status_code=204)
async def delete_teacher(
    teacher_id: int,
    session: AsyncSession = Depends(get_session),
    _user: dict = Depends(superadmin),
) -> None:
    try:
        await admin_service.remove_teacher(session, teacher_id=teacher_id)
    except ApiError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc


@router.get("/stats")
async def platform_stats(
    session: AsyncSession = Depends(get_session),
    _user: dict = Depends(superadmin),
) -> dict:
    return await admin_service.get_stats(session)
