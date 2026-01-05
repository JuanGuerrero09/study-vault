import json
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from scripts.models import Question

# Initialize the receptionist
app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/api/questions", response_model=List[Question])
async def get_questions(
    subject: str = "Hydrology",
    difficulty: Optional[str] = None,
    is_exam: Optional[bool] = None):

    file_path = os.path.join("data", f"{subject.lower()}.json") # type: ignore

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Subject not found")

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    questions = [Question(**item) for item in data]

    print(f"Total questions before filtering: {len(questions)}")


    if difficulty:
        questions = [q for q in questions if q.difficulty.lower() == difficulty.lower()]
    
    if is_exam is not None:
        questions = [q for q in questions if q.is_exam == is_exam]

    print(f"Total questions after filtering: {len(questions)}")
        
    return questions
