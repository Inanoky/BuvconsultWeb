from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import session, models, schemas
from sqlalchemy.orm import joinedload

router = APIRouter()

def get_db():
    db = session.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.AttendanceRead)
def create_attendance(record: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    attendance = models.Attendance(
        worker_id=record.worker_id,
        action=record.action,
        location_id=record.location_id,
        work_id=record.work_id,
        worker_profession=record.worker_profession
    )
    db.add(attendance)
    db.commit()

    # reload safely with relations
    result = db.query(models.Attendance).options(
        joinedload(models.Attendance.worker),
        joinedload(models.Attendance.location),
        joinedload(models.Attendance.work)
    ).filter_by(id=attendance.id).first()

    if not result:
        raise HTTPException(status_code=500, detail="Attendance could not be created")

    return result


@router.get("/", response_model=list[schemas.AttendanceRead])
def get_attendance(db: Session = Depends(get_db)):
    return db.query(models.Attendance).options(joinedload(models.Attendance.worker)).all()

# Clear attendance log
@router.delete("/clear")
def clear_attendance_log(db: Session = Depends(get_db)):
    db.query(models.Attendance).delete()
    db.commit()
    return {"detail": "Attendance log cleared"}


# Edit a single clock in/out timestamp
@router.patch("/{attendance_id}", response_model=schemas.AttendanceRead)
def update_attendance_time(attendance_id: int, update: schemas.AttendanceUpdate, db: Session = Depends(get_db)):
    record = db.query(models.Attendance).get(attendance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    record.timestamp = update.timestamp
    db.commit()
    db.refresh(record)
    return record