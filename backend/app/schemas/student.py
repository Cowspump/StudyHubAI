from __future__ import annotations

from pydantic import BaseModel


class SubmitTestRequest(BaseModel):
    answers: list[int]


class SendMessageRequest(BaseModel):
    to_id: int
    text: str
