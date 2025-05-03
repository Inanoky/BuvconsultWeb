from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import models, schemas, session
from database.models import Work, Location


router = APIRouter()

# Dependency to get DB session
def get_db():
    db = session.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 🔹 GET /api/locations/ — list all locations
@router.get("/", response_model=list[schemas.LocationRead])
def get_locations(db: Session = Depends(get_db)):
    return db.query(models.Location).all()

# 🔹 POST /api/locations/ — create a new location
# locations.py
@router.post("/", response_model=schemas.LocationRead)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Location).filter_by(name=location.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Location already exists")
    new_location = models.Location(
        name=location.name,
        units=location.units,
        amounts=location.amounts
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location


# 🔹 DELETE /api/locations/{location_id} — delete a location

@router.delete("/clear-all")
def clear_all_locations_and_works(db: Session = Depends(get_db)):
    db.query(models.Work).delete()
    db.query(models.Location).delete()
    db.commit()
    return {"detail": "All works and locations deleted"}



@router.delete("/{location_id}")
def delete_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(models.Location).filter_by(id=location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(location)
    db.commit()
    return {"detail": "Location deleted"}


@router.put("/update")
def update_location(data: schemas.LocationCreate, db: Session = Depends(get_db)):
    location = db.query(models.Location).filter_by(name=data.name).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    location.units = data.units
    location.amounts = data.amounts
    db.commit()
    return {"detail": "Location updated"}

