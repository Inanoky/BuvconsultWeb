# backend/routers/invoices.py

from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from database.session import get_db
from database import models, schemas
from services.invoice_parser import run_invoice_parser
from pydantic import BaseModel

router = APIRouter()

# 1. POST /invoices/parse → run parser with frontend prompt
class PromptInput(BaseModel):
    prompt: str

@router.post("/parse")
def parse_invoices(data: PromptInput):
    return run_invoice_parser(data.prompt)

# 2. GET /invoices → return all stored invoices
@router.get("/", response_model=list[schemas.InvoiceRead])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(models.Invoice).all()


# Clear both invoices and scanned_files tables
@router.post("/clearall")
def clear_invoices(db: Session = Depends(get_db)):
    invoice_count = db.query(models.Invoice).delete()
    scanned_count = db.query(models.ScannedFile).delete()
    db.commit()
    return {
        "message": f"Cleared {invoice_count} invoices and {scanned_count} scanned files."
    }