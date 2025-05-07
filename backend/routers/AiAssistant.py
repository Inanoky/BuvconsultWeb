from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import Invoice
from pydantic import BaseModel
from openai import OpenAI
from config import OPENAI_API_KEY
import json

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)


@router.post("/AskAi")
async def categorize_invoices(prompt: str = Form(...), db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    if not invoices:
        return []



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
    return {"response": response.choices[0].message.content}



