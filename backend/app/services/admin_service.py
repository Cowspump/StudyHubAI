from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ApiError
from app.core.security import hash_password
from app.repositories import admin_repository, auth_repository


async def list_teachers(session: AsyncSession) -> list[dict]:
    teachers = await admin_repository.get_all_teachers(session)
    return [
        {
            "id": t.id,
            "name": t.name,
            "email": t.email,
            "role": t.role,
            "is_verified": t.is_verified,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in teachers
    ]


async def create_teacher(session: AsyncSession, name: str, email: str, password: str) -> dict:
    existing = await auth_repository.find_user_by_email(session, email)
    if existing:
        raise ApiError(status_code=409, detail="Email already registered")

    teacher = await admin_repository.create_teacher(
        session,
        name=name,
        email=email,
        password_hash=hash_password(password),
    )
    await session.commit()
    return {
        "id": teacher.id,
        "name": teacher.name,
        "email": teacher.email,
        "role": teacher.role,
        "is_verified": teacher.is_verified,
        "created_at": teacher.created_at.isoformat() if teacher.created_at else None,
    }


async def update_teacher(
    session: AsyncSession, teacher_id: int, name: str | None, email: str | None
) -> dict:
    teacher = await admin_repository.get_teacher_by_id(session, teacher_id)
    if not teacher:
        raise ApiError(status_code=404, detail="Teacher not found")

    if email and email != teacher.email:
        existing = await auth_repository.find_user_by_email(session, email)
        if existing:
            raise ApiError(status_code=409, detail="Email already in use")

    await admin_repository.update_teacher(session, teacher_id, name=name, email=email)
    await session.commit()

    updated = await admin_repository.get_teacher_by_id(session, teacher_id)
    return {
        "id": updated.id,
        "name": updated.name,
        "email": updated.email,
        "role": updated.role,
        "is_verified": updated.is_verified,
        "created_at": updated.created_at.isoformat() if updated.created_at else None,
    }


async def remove_teacher(session: AsyncSession, teacher_id: int) -> None:
    teacher = await admin_repository.get_teacher_by_id(session, teacher_id)
    if not teacher:
        raise ApiError(status_code=404, detail="Teacher not found")

    await admin_repository.delete_teacher(session, teacher_id)
    await session.commit()


async def get_stats(session: AsyncSession) -> dict:
    return await admin_repository.get_platform_stats(session)
