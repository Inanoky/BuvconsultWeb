from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import Invoice
from openai import OpenAI
from config import OPENAI_API_KEY
import json
import time

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)

# IDs
ASSISTANT_ID = 'asst_3WqdS2y0qvr52Wj9QpINCdrw'
THREAD_ID = 'thread_FXzYzBV35xGQ9fzuqGmOVCMH'

@router.post("/AskAi")
async def categorize_invoices(prompt: str = Form(...), db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    if not invoices:
        print("📭 No invoices found.")
        return []

    invoice_summaries = [
        {
            "id": inv.id,
            "item": inv.item or "",
            "seller": inv.seller or "",
            "unit": inv.unit or "",
            "sum": inv.sum or "",
            "currency": inv.currency or "",
        }
        for inv in invoices
    ]

    user_message = f"{prompt}"
    print("\n📤 Sending to GPT:\n", user_message)

    try:
        message_response = client.beta.threads.messages.create(
            thread_id=THREAD_ID,
            role="user",
            content=user_message
        )
        print("✅ Message successfully added to thread.")
    except Exception as e:
        print("❌ Failed to add message:", e)
        return {"error": "Failed to add message to thread", "details": str(e)}

    try:
        run = client.beta.threads.runs.create(
            thread_id=THREAD_ID,
            assistant_id=ASSISTANT_ID
        )
        print("🏃 Assistant run started:", run.id)
    except Exception as e:
        print("❌ Failed to create assistant run:", e)
        return {"error": "Failed to create assistant run", "details": str(e)}

    try:
        while True:
            run_status = client.beta.threads.runs.retrieve(
                thread_id=THREAD_ID,
                run_id=run.id
            )
            if run_status.status == "completed":
                print("✅ Assistant run completed.")
                break
            elif run_status.status == "failed":
                print("❌ Assistant run failed:\n", run_status.model_dump())
                return {
                    "error": "Assistant run failed",
                    "run_status": run_status.model_dump()
                }
            time.sleep(1)
    except Exception as e:
        print("❌ Error during polling:", e)
        return {"error": "Error during run polling", "details": str(e)}

    try:
        messages = client.beta.threads.messages.list(thread_id=THREAD_ID)
        latest_message = messages.data[0]
        response_text = latest_message.content[0].text.value
        print("\n📥 Received from GPT:\n", response_text)
        return {"response": response_text}
    except Exception as e:
        print("❌ Failed to read GPT message:", e)
        return {"error": "Failed to read messages", "details": str(e)}
