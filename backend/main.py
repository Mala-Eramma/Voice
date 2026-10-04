
import os
import threading

from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .database import engine, get_db
from .models import Base, CalculationHistory
from .calculator import calculate
from .speaker import speak

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

# Create the database table if it does not exist
Base.metadata.create_all(bind=engine)

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR),
    name="static"
)


@app.get("/")
def home():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.get("/history-page")
@app.get("/history.html")
def history_page():
    return FileResponse(os.path.join(FRONTEND_DIR, "history.html"))


@app.post("/calculate")
def calculate_expression(
    expression: str,
    db: Session = Depends(get_db)
):
    answer = calculate(expression)

    if answer == "Invalid calculation":
        raise HTTPException(status_code=400, detail="Invalid calculation")

    try:
        record = CalculationHistory(
            expression=expression,
            answer=str(answer)
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        result = {
            "id": record.id,
            "expression": record.expression,
            "answer": answer,
            "created_at": str(record.created_at)
        }

    except Exception as error:
        db.rollback()
        print("DATABASE SAVE ERROR:", error)
        raise HTTPException(
            status_code=500,
            detail="Could not save calculation to database"
        )

    try:
        threading.Thread(
            target=speak,
            args=(answer,),
            daemon=True
        ).start()
    except Exception as error:
        print("VOICE ERROR:", error)

    return result


@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    records = (
        db.query(CalculationHistory)
        .order_by(CalculationHistory.id.desc())
        .all()
    )

    return [
        {
            "id": item.id,
            "expression": item.expression,
            "answer": item.answer,
            "created_at": str(item.created_at)
        }
        for item in records
    ]


@app.delete("/history")
def delete_history(db: Session = Depends(get_db)):
    db.query(CalculationHistory).delete()
    db.commit()
    return {"message": "History deleted"}