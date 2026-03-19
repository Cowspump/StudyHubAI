from __future__ import annotations

from pydantic import BaseModel


class GroupCreateRequest(BaseModel):
    name: str


class MaterialCreateRequest(BaseModel):
    topic: str
    title: str
    type: str = "pdf"
    url: str
    group_ids: list[int] = []
    file_name: str | None = None


class TestCreateRequest(BaseModel):
    title: str
    group_ids: list[int] = []
    questions: list[dict] = []


class TestUpdateRequest(BaseModel):
    title: str
    group_ids: list[int] = []
    questions: list[dict] = []


class ProfileUpdateRequest(BaseModel):
    name: str | None = None
    position: str | None = None
    phone: str | None = None
    telegram: str | None = None
    bio: str | None = None
    photo: str | None = None


class ApiKeyUpdateRequest(BaseModel):
    openai_key: str | None = None


class BulkStudentsRequest(BaseModel):
    group_id: int
    students: list[dict]  # [{name, email, password}]
