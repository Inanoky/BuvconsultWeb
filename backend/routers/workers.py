# backend/routers/workers.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas
from database.session import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=list[schemas.WorkerRead])
def get_workers(db: Session = Depends(get_db)):
    return db.query(models.Worker).all()

@router.post("/", response_model=schemas.WorkerRead)
def add_worker(worker: schemas.WorkerCreate, db: Session = Depends(get_db)):
    if db.query(models.Worker).filter_by(code=worker.code).first():
        raise HTTPException(status_code=400, detail="Worker with this personal code already exists.")
    db_worker = models.Worker(**worker.dict())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

@router.delete("/{worker_id}")
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    worker = db.query(models.Worker).filter(models.Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    db.delete(worker)
    db.commit()
    return {"detail": "Worker deleted"}