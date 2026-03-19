from fastapi import APIRouter

from app.api.routes.admin import router as admin_router
from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.teacher import router as teacher_router
from app.api.routes.student import router as student_router
from app.api.routes.public import router as public_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(teacher_router)
api_router.include_router(student_router)
api_router.include_router(public_router)
