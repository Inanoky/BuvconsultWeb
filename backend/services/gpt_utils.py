from fastapi import APIRouter
from backend.database.session import SessionLocal
from backend.database.models import Invoice
from backend.services.invoice_parser import run_invoice_workflow

router = APIRouter()

@router.post("/parse")
def parse_invoices():
    return run_invoice_workflow()

@router.get("/")
def get_invoices():
    db = SessionLocal()
    invoices = db.query(Invoice).all()
    db.close()
    return invoices
