import os
import threading

from fastapi import FastAPI, Depends
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, get_db
from .models import Base, CalculationHistory
from .calculator import calculate
from .speaker import speak


app = FastAPI()


BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)


Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


@app.get("/")
def home():
    return FileResponse(
        os.path.join(FRONTEND_DIR, "index.html")
    )


@app.get("/history-page")
def history_page():
    return FileResponse(
        os.path.join(FRONTEND_DIR, "history.html")
    )


@app.post("/calculate")
def calculate_expression(
    expression: str,
    db: Session = Depends(get_db)
):

    answer = calculate(expression)

    history = CalculationHistory(
        expression=expression,
        answer=str(answer)
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    threading.Thread(
        target=speak,
        args=(answer,),
        daemon=True
    ).start()

    return {
        "expression": expression,
        "answer": answer
    }


@app.get("/history")
def get_history(
    db: Session = Depends(get_db)
):

    history = (
        db.query(CalculationHistory)
        .order_by(CalculationHistory.id.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "expression": item.expression,
            "answer": item.answer,
            "created_at": item.created_at
        }
        for item in history
    ]


@app.delete("/history")
def delete_history(
    db: Session = Depends(get_db)
):

    db.query(CalculationHistory).delete()
    db.commit()

    return {
        "message": "History deleted"
    }