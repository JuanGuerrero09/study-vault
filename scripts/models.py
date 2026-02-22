from pydantic import BaseModel
from typing import List

class Question(BaseModel):
    subject: str
    topic: str
    entry_type: str
    difficulty: str = "MEDIUM"
    question: str
    answer: str
    is_exam: bool
    tags: List[str]