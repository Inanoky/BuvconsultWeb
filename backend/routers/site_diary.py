# routers/site_diary.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import SiteDiary, Attendance, Worker, Work, Location
from database.schemas import SiteDiaryCreate, SiteDiaryUpdate, SiteDiaryOut
from datetime import datetime
import pandas as pd

router = APIRouter(prefix="/api/site-diary", tags=["SiteDiary"])

@router.get("/", response_model=list[SiteDiaryOut])
def list_entries(db: Session = Depends(get_db)):
    return db.query(SiteDiary).order_by(SiteDiary.date.desc()).all()

@router.get("/{date}", response_model=list[SiteDiaryOut])
def get_day_entries(date: str, db: Session = Depends(get_db)):
    return db.query(SiteDiary).filter(SiteDiary.date == date).all()

@router.post("/", response_model=SiteDiaryOut)
def create_entry(entry: SiteDiaryCreate, db: Session = Depends(get_db)):
    new_entry = SiteDiary(**entry.dict())
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.put("/{entry_id}", response_model=SiteDiaryOut)
def update_entry(entry_id: int, entry: SiteDiaryUpdate, db: Session = Depends(get_db)):
    existing = db.query(SiteDiary).filter(SiteDiary.id == entry_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Entry not found")
    for key, value in entry.dict().items():
        setattr(existing, key, value)
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db.query(SiteDiary).filter(SiteDiary.id == entry_id).delete()
    db.commit()
    return {"detail": "Deleted"}

@router.delete("/")
def clear_diary(db: Session = Depends(get_db)):
    db.query(SiteDiary).delete()
    db.commit()
    return {"detail": "All diary entries deleted."}

@router.post("/generate")
def generate_from_attendance(db: Session = Depends(get_db)):
    data = db.query(Attendance.timestamp, Attendance.worker_id, Attendance.work_id, Attendance.location_id).all()
    df = pd.DataFrame(data, columns=["timestamp", "worker_id", "work_id", "location_id"])
    df["date"] = pd.to_datetime(df["timestamp"]).dt.date
    grouped = df.groupby(["date", "work_id", "location_id"]).agg(workers=("worker_id", "nunique")).reset_index()

    work_map = {w.id: (w.task, w.units) for w in db.query(Work).all()}
    loc_map = {l.id: l.name for l in db.query(Location).all()}

    for _, row in grouped.iterrows():
        work_name, unit = work_map.get(row.work_id, ("", ""))
        location_name = loc_map.get(row.location_id, "")
        diary = SiteDiary(
            date=row.date,
            work=work_name,
            unit=unit,
            amount=0,
            workers=int(row.workers),
            location=location_name,
            comments="Auto-generated from attendance"
        )
        db.add(diary)
    db.commit()
    return {"detail": "Diary generated"}
