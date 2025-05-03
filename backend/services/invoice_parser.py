import json
from openai import OpenAI
from config import OPENAI_API_KEY
from services.driver_utils import download_and_convert
from database.session import SessionLocal
from database.models import Invoice, ScannedFile

client = OpenAI(api_key=OPENAI_API_KEY)

def run_invoice_parser(prompt: str = None):
    file_data = download_and_convert()
    raw_responses = []

    prompt_to_use = prompt or (
        "Extract all invoice table rows as a list of arrays. Each row must contain: "
        "[date, invoice_number, seller, buyer, item, quantity, unit, price, currency, cost_without_vat, currency_eur_vat]."
    )

    db = SessionLocal()

    for file_name, file_id, image_list in file_data:
        # Skip if already scanned
        if db.query(ScannedFile).filter_by(file_id=file_id).first():
            print(f"⏭️ Skipping already scanned file: {file_name}")
            continue

        print(f"\n📄 Processing file: {file_name} ({len(image_list)} pages)")

        for i, image_base64 in enumerate(image_list):
            print(f"  ➜ Sending page {i + 1} to GPT...")

            response = client.chat.completions.create(
                model="gpt-4.1",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_to_use},
                            {"type": "image_url", "image_url": {
                                "url": f"data:image/png;base64,{image_base64}",
                                "detail": "high"
                            }}
                        ]
                    }
                ],
                temperature=0.2,
                max_tokens=2000
            )

            raw_text = response.choices[0].message.content
            print("📤 GPT response:\n", raw_text)
            raw_responses.append(raw_text)

            try:
                cleaned = raw_text.replace("```json", "").replace("```", "").strip()
                data = json.loads(cleaned)

                for row in data:
                    invoice = Invoice(
                        invoice_date=row.get("invoice_date"),
                        invoice_number=row.get("invoice_number"),
                        seller=row.get("seller"),
                        buyer=row.get("buyer"),
                        item=row.get("item"),
                        quantity=row.get("quantity"),
                        unit=row.get("unit"),
                        price=row.get("price"),
                        sum=row.get("sum"),
                        currency=row.get("currency"),
                        file_id=file_id

                    )
                    db.add(invoice)

                # Record scanned file
                existing = db.query(ScannedFile).filter_by(file_id=file_id).first()
                if not existing:
                    db.add(ScannedFile(file_id=file_id, file_name=file_name))
                db.commit()

            except Exception as e:
                print(f"⚠️ Failed to save parsed data: {e}")

    db.close()
    return {"results": raw_responses}
