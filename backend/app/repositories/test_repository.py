from __future__ import annotations

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.test import Test


async def get_tests_by_teacher(session: AsyncSession, teacher_id: int) -> list[Test]:
    result = await session.execute(
        select(Test).where(Test.teacher_id == teacher_id).order_by(Test.created_at.desc())
    )
    return list(result.scalars().all())


async def get_tests_by_group(session: AsyncSession, group_id: int) -> list[Test]:
    result = await session.execute(
        select(Test).where(Test.group_ids.any(group_id)).order_by(Test.created_at.desc())
    )
    return list(result.scalars().all())


async def get_test_by_id(session: AsyncSession, test_id: int) -> Test | None:
    result = await session.execute(select(Test).where(Test.id == test_id))
    return result.scalar_one_or_none()


async def create_test(
    session: AsyncSession,
    title: str,
    teacher_id: int,
    group_ids: list[int],
    questions: list[dict],
) -> Test:
    test = Test(
        title=title,
        teacher_id=teacher_id,
        group_ids=group_ids,
        questions=questions,
    )
    session.add(test)
    await session.flush()
    return test


async def update_test(
    session: AsyncSession,
    test_id: int,
    title: str,
    group_ids: list[int],
    questions: list[dict],
) -> None:
    await session.execute(
        update(Test)
        .where(Test.id == test_id)
        .values(title=title, group_ids=group_ids, questions=questions)
    )


async def delete_test(session: AsyncSession, test_id: int) -> None:
    await session.execute(delete(Test).where(Test.id == test_id))
