# backend/database/models.py
from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy import ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .session import Base
from datetime import datetime

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    salary = Column(Float, nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"))
    action = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    work_id = Column(Integer, ForeignKey("works.id"), nullable=True)
    worker_profession = Column(String, nullable=True)

    worker = relationship("Worker")
    location = relationship("Location")
    work = relationship("Work")


#This is for saving locations and works

class Work(Base):
    __tablename__ = "works"
    id = Column(Integer, primary_key=True, index=True)
    task = Column(String, nullable=False)
    units = Column(String,nullable=True)
    amounts = Column(Float, nullable=True)
    location_id = Column(Integer, ForeignKey("locations.id"))

    location = relationship("Location", back_populates="works")




class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    units = Column(String, nullable=True)
    amounts = Column(Float, nullable=True)

    works = relationship("Work", back_populates="location", cascade="all, delete")


#For invocies modules

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_date = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    seller = Column(String, nullable=True)
    buyer = Column(String, nullable=True)
    item = Column(String, nullable=True)  # Product/Service provided
    quantity = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    price = Column(Float, nullable=True)  # Unit price
    sum = Column(Float, nullable=True)
    currency = Column(String, nullable=True)
    file_id = Column(String, nullable=True)
    category = Column(String, nullable=True)
    # Google Drive file ID


#This table stores ID, file_id and file_name for each file to avoid duplicates

class ScannedFile(Base):
    __tablename__ = "scanned_files"

    id = Column(Integer, primary_key=True)
    file_id = Column(String, unique=True)
    file_name = Column(String)

class SiteDiary(Base):
    __tablename__ = "site_diary"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    location = Column(String)
    work = Column(String)
    unit = Column(String)
    amount = Column(Float)
    workers = Column(Integer)
    comments = Column(String)