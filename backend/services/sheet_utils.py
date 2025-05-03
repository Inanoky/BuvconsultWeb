# drive_utils.py
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.http import MediaIoBaseDownload
import os
import io

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def authenticate_drive():
    creds = None
    if os.path.exists('../token.json'):
        creds = Credentials.from_authorized_user_file('../token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                '../credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('../token.json', 'w') as token:
            token.write(creds.to_json())
    return creds

def list_new_pdfs_in_folder(service, folder_id, seen_ids):
    query = f"'{folder_id}' in parents and mimeType='application/pdf' and trashed = false"
    results = service.files().list(
        q=query,
        fields="files(id, name, modifiedTime)",
        orderBy="modifiedTime desc"
    ).execute()

    files = results.get('files', [])
    new_files = [f for f in files if f['id'] not in seen_ids]

    return new_files

def download_pdf_as_bytes(service, file_id):
    request = service.files().get_media(fileId=file_id)
    file_stream = io.BytesIO()
    downloader = MediaIoBaseDownload(file_stream, request)

    done = False
    while not done:
        status, done = downloader.next_chunk()

    file_stream.seek(0)
    return file_stream
