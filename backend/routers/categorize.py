from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import Invoice
from pydantic import BaseModel
from openai import OpenAI
from config import OPENAI_API_KEY
import json

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)

class CategoryInput(BaseModel):
    categories: list[str]

@router.post("/categorize")
def categorize_invoices(data: CategoryInput, db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    if not invoices:
        return []

    prompt = (
        "You are a helpful assistant."
        " Given the following list of categories: \n"
        f"{data.categories}\n"
        "Assign the best matching category to each invoice using the 'item', 'seller', and 'unit' fields.\n"
        "Return the result as a JSON array of objects in this format: {id, category}.\n"
        "Do not add comments or explanations."
    )

    invoice_summaries = [
        {
            "id": inv.id,
            "item": inv.item or "",
            "seller": inv.seller or "",
            "unit": inv.unit or ""
        }
        for inv in invoices
    ]

    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "text", "text": json.dumps(invoice_summaries)}
            ]}
        ],
        temperature=0,
        max_tokens=10000  # Adjust if needed, GPT-4 Turbo can handle more
    )

    raw = response.choices[0].message.content.strip()
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    parsed = json.loads(cleaned)

    # Update invoice rows in DB
    for obj in parsed:
        invoice = db.query(Invoice).filter_by(id=obj["id"]).first()
        if invoice:
            invoice.category = obj["category"]

    db.commit()
    return db.query(Invoice).all()
