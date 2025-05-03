from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from openai import OpenAI
import base64
from config import OPENAI_API_KEY
from services.gpt_response_cleaner import clean_gpt_json_response  # ✅ make sure this import is active

router = APIRouter()
client = OpenAI(api_key=OPENAI_API_KEY)


@router.post("/gpt-image-parse-base64")
async def gpt_image_parse_base64(prompt: str = Form(...), file: UploadFile = File(...)):
    """
    Accepts a raw image file + prompt from frontend-app,
    sends them to GPT-4o Vision as base64, returns raw response.
    """
    try:
        print("\n📥 GPT Vision base64 image parse triggered")
        print("📄 File:", file.filename)

        # Read file and encode as base64
        image_bytes = await file.read()
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        image_data_url = f"data:image/png;base64,{b64}"

        # Call GPT
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at reading construction schedules and returning structured JSON."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data_url,
                                "detail": "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens=4000,
            top_p=1.0,
            temperature=0,
        )

        # ✅ Extract and clean response
        raw_response = response.choices[0].message.content
        cleaned_response = clean_gpt_json_response(raw_response)

        print("✅ GPT Vision cleaned response:", cleaned_response)
        return {"response": cleaned_response}

    except Exception as e:
        print("❌ GPT Vision error:", e)
        return {"error": str(e)}
