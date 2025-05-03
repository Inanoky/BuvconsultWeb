# backend/database/schemas.py
from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional


class WorkerCreate(BaseModel):
    name: str
    surname: str
    code: str
    role: str
    salary: float

class WorkerRead(WorkerCreate):
    id: int

    class Config:
        orm_mode = True

class AttendanceCreate(BaseModel):
    worker_id: int
    action: str
    location_id: int | None = None
    work_id: int | None = None
    worker_profession: str | None = None

class AttendanceUpdate(BaseModel):
    timestamp: datetime

class AttendanceRead(BaseModel):
    id: int
    worker_id: int
    action: str
    timestamp: datetime
    location_id: int | None = None
    work_id: int | None = None
    worker_profession: str | None = None

    class Config:
        orm_mode = True

class LocationCreate(BaseModel):
    name: str
    units: str | None = None
    amounts: float | None = None


class LocationRead(LocationCreate):
    id: int

    class Config:
        orm_mode = True


#Saving Location and works

class WorkCreate(BaseModel):
    location_name: str
    task: str
    units: str | None = None
    amounts: float | None = None

class WorkRead(BaseModel):
    id: int
    task: str
    location_id: int
    units: str | None = None
    amounts: float | None = None
    class Config:
        orm_mode = True

class WorkUpdate(BaseModel):
    units: str | None = None
    amounts: float | None = None

#This is for invoice parsing


class InvoiceCreate(BaseModel):
    invoice_date: Optional[str]
    invoice_number: Optional[str]
    seller: Optional[str]
    buyer: Optional[str]
    item: Optional[str]
    quantity: Optional[float]
    unit: Optional[str]
    price: Optional[float]
    sum:  Optional[float]
    currency: Optional[str]
    file_id: Optional[str]
    category: Optional[str]


class InvoiceRead(InvoiceCreate):
    id: int

    class Config:
        from_attributes = True

#Site diary schemas
class SiteDiaryBase(BaseModel):
    date: date
    location: str
    work: str
    unit: Optional[str] = None
    amount: float
    workers: int
    comments: str = ""

class SiteDiaryCreate(SiteDiaryBase):
    pass

class SiteDiaryUpdate(SiteDiaryBase):
    pass

class SiteDiaryOut(SiteDiaryBase):
    id: int
    class Config:
        orm_mode = True
