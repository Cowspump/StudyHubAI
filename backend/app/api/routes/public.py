from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.repositories import group_repository

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/groups")
async def list_all_groups(
    session: AsyncSession = Depends(get_session),
) -> list[dict]:
    groups = await group_repository.get_all_groups(session)
    return [{"id": g.id, "name": g.name} for g in groups]
