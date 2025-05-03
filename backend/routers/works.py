from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from database import models, schemas, session

router = APIRouter()

# Dependency
def get_db():
    db = session.SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create a new work task linked to a location
# works.py
@router.post("/", response_model=schemas.WorkRead)
def create_work(work: schemas.WorkCreate, db: Session = Depends(get_db)):
    location = db.query(models.Location).filter_by(name=work.location_name).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")

    new_work = models.Work(
        task=work.task,
        location=location,
        units=work.units,
        amounts=work.amounts
    )
    db.add(new_work)
    db.commit()
    db.refresh(new_work)

    return new_work
# ✅ SQLAlchemy model will be converted to WorkRead automatically


# Return all works from the database
@router.get("/", response_model=list[schemas.WorkRead])
def get_works(db: Session = Depends(get_db)):
    return db.query(models.Work).all()

# works.py
from fastapi import Path

# works.py
@router.put("/update/{work_id}")
def update_work(work_id: int, data: schemas.WorkUpdate, db: Session = Depends(get_db)):
    work = db.query(models.Work).filter_by(id=work_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Work not found")
    work.units = data.units
    work.amounts = data.amounts
    db.commit()
    return {"detail": "Work updated"}



