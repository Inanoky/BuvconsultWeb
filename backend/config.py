# config.py
import os
from dotenv import load_dotenv

# 1) load .env file into os.environ
load_dotenv()

FOLDER_ID    = "1ubUQ7mKCswHAdP9GBG7_PBUxByJYT9GW"
SHEET_ID     = "1T6x66qCzIN9ij2tScou24vFVQGjp6QN6uTy96Gddl8A"
POPPLER_PATH = r"C:\Tools\Release-24.08.0-0\poppler-24.08.0\Library\bin"

# 2) now pull it out
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not found in environment")
