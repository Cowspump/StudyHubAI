from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.test_result import TestResult


async def get_results_by_user(session: AsyncSession, user_id: int) -> list[TestResult]:
    result = await session.execute(
        select(TestResult).where(TestResult.user_id == user_id).order_by(TestResult.created_at.desc())
    )
    return list(result.scalars().all())


async def get_results_by_test(session: AsyncSession, test_id: int) -> list[TestResult]:
    result = await session.execute(
        select(TestResult).where(TestResult.test_id == test_id).order_by(TestResult.created_at.desc())
    )
    return list(result.scalars().all())


async def get_result_by_test_and_user(
    session: AsyncSession, test_id: int, user_id: int
) -> TestResult | None:
    result = await session.execute(
        select(TestResult)
        .where(TestResult.test_id == test_id, TestResult.user_id == user_id)
        .order_by(TestResult.created_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_all_results(session: AsyncSession) -> list[TestResult]:
    result = await session.execute(
        select(TestResult).order_by(TestResult.created_at.desc())
    )
    return list(result.scalars().all())


async def create_result(
    session: AsyncSession,
    test_id: int,
    user_id: int,
    score: int,
    total: int,
    answers: list[int],
) -> TestResult:
    res = TestResult(
        test_id=test_id,
        user_id=user_id,
        score=score,
        total=total,
        answers=answers,
    )
    session.add(res)
    await session.flush()
    return res
