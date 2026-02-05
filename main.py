import json
import os
import random
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from scripts.models import Question

# Initialize the receptionist
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# --- PAGE ROUTES ---


@app.get("/")
async def read_root():
    return FileResponse("static/landing.html")


@app.get("/bank")
async def read_bank():
    return FileResponse("static/question_bank.html")


@app.get("/study")
async def read_session():
    return FileResponse("static/study_session.html")


# @app.get("/exam")
# async def read_exam():
#     return FileResponse("static/exam.html")


@app.get(path="/theory")
async def read_theory():
    return FileResponse("static/theory.html")


@app.get("/debug_files")
def list_files():
    import os

    files_list = []
    # Walk through all folders and list every file the server can see
    for root, dirs, files in os.walk("."):
        for name in files:
            files_list.append(os.path.join(root, name))
    return {"files": files_list}


@app.get("/api/note/{subject}")
async def get_note(subject: str):
    # Security: ensure we only read .md files from data folder
    filename = f"{subject.lower()}_notes.md"
    file_path = os.path.join("data", filename)

    if not os.path.exists(file_path):
        return PlainTextResponse(f"# No notes found for {subject}", status_code=404)

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    return PlainTextResponse(content)


@app.get("/api/questions", response_model=List[Question])
async def get_questions(
    subject: str = "Hydrology",
    difficulty: Optional[str] = None,
    topic: Optional[str] = None,
    is_exam: Optional[bool] = None,
    limit: Optional[int] = None,  # New parameter
):
    file_path = os.path.join("data", f"{subject.lower()}.json")  # type: ignore

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Subject not found")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = [print(item) for item in data]
    questions = [Question(**item) for item in data]

    if difficulty:
        questions = [q for q in questions if q.difficulty.lower() == difficulty.lower()]

    if topic:
        questions = [q for q in questions if q.topic.lower() == topic.lower()]

    if is_exam is not None:
        questions = [q for q in questions if q.is_exam == is_exam]

    if limit is not None:
        questions = random.sample(questions, min(limit, len(questions)))

    return questions
