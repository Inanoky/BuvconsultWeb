import os
import io
import base64
from typing import List, Tuple
from google.oauth2 import service_account
from googleapiclient.discovery import build
from pdf2image import convert_from_bytes
import requests

# Path to your service account JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'Credentials', 'ai-test-api-455413-01ba7a584b06.json')
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']


#We use this code for invoices

creds = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

drive_service = build('drive', 'v3', credentials=creds)

def download_and_convert() -> List[Tuple[str, str, List[str]]]:

    FOLDER_ID = "1ubUQ7mKCswHAdP9GBG7_PBUxByJYT9GW"


    results = drive_service.files().list(
        q=f"'{FOLDER_ID}' in parents and mimeType='application/pdf'",
        pageSize=1000,
        fields="files(id, name)"
    ).execute()

    files = results.get('files', [])

    output = []

    for file in files:
        file_id = file['id']
        file_name = file['name']
        print(f"Downloading: {file_name}")

        request = drive_service.files().get_media(fileId=file_id)
        fh = io.BytesIO()
        downloader = requests.get(
            f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media",
            headers={"Authorization": f"Bearer {creds.token}"}
        )
        fh.write(downloader.content)

        images = convert_from_bytes(
            fh.getvalue(),
            poppler_path=r"C:\Tools\Release-24.08.0-0\poppler-24.08.0\Library\bin"
        )

        encoded_pages = []
        for img in images:
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            base64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")
            encoded_pages.append(base64_img)

        output.append((file_name, file_id, encoded_pages))

    return output
