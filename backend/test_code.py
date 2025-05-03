import time
import json
import sqlite3
import re
import shutil
import sqlite3
import pandas as pd
from pathlib import Path
from openai import OpenAI
from config import OPENAI_API_KEY
from services.gpt_response_cleaner import clean_gpt_json_response  # Optional

client = OpenAI(api_key=OPENAI_API_KEY)

THREAD_STORE_PATH = Path("assistant_threads.json")
SANDBOX_PATTERN = re.compile(r"sandbox:/mnt/data/([\w_.-]+)")


def load_thread_map():
    if THREAD_STORE_PATH.exists():
        with open(THREAD_STORE_PATH, "r") as f:
            return json.load(f)
    return {}

def save_thread_map():
    with open(THREAD_STORE_PATH, "w") as f:
        json.dump(th_thread_map, f, indent=2)

th_thread_map = load_thread_map()  # mapping assistant.id -> list of thread_ids


def export_and_combine_to_single_json(db_path: Path, output_path: Path):
    conn = sqlite3.connect(db_path)
    tables = ["locations", "works", "attendance", "invoices", "workers"]
    combined = {}

    for table in tables:
        try:
            df = pd.read_sql(f"SELECT * FROM {table}", conn)
            combined[table] = df.to_dict(orient="records")
            print(f"✅ Loaded {table} ({len(df)} rows)")
        except Exception as e:
            print(f"⚠️ Failed to read {table}: {e}")

    conn.close()

    with open(output_path, "w") as f:
        json.dump(combined, f, indent=2)

    print(f"📦 Combined payload written to: {output_path.name}")
    return output_path


def choose_thread(assistant_id):
    threads = th_thread_map.get(assistant_id, [])
    if isinstance(threads, str):
        threads = [threads]  # backward compatibility

    if threads:
        print("💬 Available threads:")
        for idx, tid in enumerate(threads):
            print(f"{idx + 1}. {tid}")

        choice = input("Select thread or create new? (number/new): ").strip().lower()
        if choice == "new":
            thread = client.beta.threads.create()
            threads.append(thread.id)
            th_thread_map[assistant_id] = threads
            save_thread_map()
            print(f"🆕 Created new thread: {thread.id}")
            return thread.id
        else:
            try:
                selected_idx = int(choice) - 1
                return threads[selected_idx]
            except (IndexError, ValueError):
                print("❌ Invalid selection. Creating new thread.")

    thread = client.beta.threads.create()
    th_thread_map[assistant_id] = [thread.id]
    save_thread_map()
    print(f"🆕 Created new thread: {thread.id}")
    return thread.id


def handle_sandbox_file_links(text, download_dir="downloads"):
    matches = SANDBOX_PATTERN.findall(text)
    for filename in matches:
        src_path = Path("/mnt/data") / filename
        dest_path = Path(download_dir) / filename
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        try:
            shutil.copy(src_path, dest_path)
            print(f"📥 Downloaded: {filename} → {dest_path}")
        except Exception as e:
            print(f"❌ Failed to copy {filename}: {e}")


def select_or_create_assistant():
    choice = input("1️⃣ Create new assistant or 2️⃣ Use existing? (1/2): ").strip()

    if choice == "1":
        name = input("Enter assistant name: ")
        assistant = client.beta.assistants.create(
            name=name,
            instructions=(
                "You are construction estimator specilasit with strong data science knowledge\n"
                "You will receive a JSON file named database_payload.json. It contains: locations, works, attendance, invoices, and workers.\n"
                "Attendance table has location_id (where works were done) and work_id (what work was done) as well as dates when works were done.\n"
                "We can assume that work is done at certain location at the last attendance record for this work at this location\n"
                "Location and work tables produced from the Ghant construction schedule chart and are dependant\n"
                "Invoices table contains all purchases done during the project\n"
                "Make educated guess and try to correlate invoice purchases with attendance table based on invoice date(assume material/services delivered same date as invoice date\n"
                "as well as Item field from Invoice table (for example concrete likely purchased for concreting works, reinforcment - for steel fixing and so on\n"
                "For each Works position from Works table you need to return fields : \n" 
                "Location/works - Units - Amounts - Total unit cost - Salary cost per unit - Material cost per unit - Machinery cost per unit - Total cost \n"     
                "Return .CSV file\n"
            ),
            model="gpt-4.1",
            tools=[{"type": "code_interpreter"}]
        )
        print(f"✅ Created Assistant: {assistant.name} ({assistant.id})")
        return assistant

    elif choice == "2":
        assistants = client.beta.assistants.list().data
        if not assistants:
            print("❌ No assistants found. Please create one first.")
            return select_or_create_assistant()

        print("Available assistants:")
        for idx, a in enumerate(assistants):
            print(f"{idx + 1}. {a.name} ({a.id})")

        selection = int(input("Select assistant by number: ")) - 1
        selected = assistants[selection]
        print(f"✅ Using Assistant: {selected.name} ({selected.id})")
        return selected

    else:
        print("Invalid choice. Try again.")
        return select_or_create_assistant()


def send_database_to_assistant(assistant):
    base_dir = Path(__file__).resolve().parent
    payload_path = base_dir / "temp_csvs" / "database_payload.json"
    db_path = base_dir / "workers.db"
    export_and_combine_to_single_json(db_path, payload_path)

    upload = client.files.create(file=open(payload_path, "rb"), purpose="assistants")
    file_id = upload.id
    print(f"✅ Uploaded database_payload.json → file_id: {file_id}")

    thread_id = choose_thread(assistant.id)
    print(f"🧵 Using thread: {thread_id}")

    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content="Please analyze the uploaded database_payload.json and return full cost breakdown.",
        attachments=[{"file_id": file_id, "tools": [{"type": "code_interpreter"}]}]
    )

    run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant.id)
    print(f"⏳ Run started: {run.id}")

    while True:
        run_status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        if run_status.status == "completed":
            print("✅ GPT Run completed successfully!")
            break
        elif run_status.status == "failed":
            print("❌ GPT Run failed.")
            print(f"🔍 Reason: {run_status.last_error}")
            return
        time.sleep(2)

    messages = client.beta.threads.messages.list(thread_id=thread_id, order="desc")
    for msg in messages.data:
        if msg.role == "assistant":
            raw = msg.content[0].text.value
            print("\n🧠 GPT Response:")
            print(raw)
            handle_sandbox_file_links(raw)
            try:
                cleaned = clean_gpt_json_response(raw)
                print("\n✅ Cleaned JSON:")
                print(cleaned)
            except Exception as e:
                print(f"⚠️ Could not clean GPT response: {e}")
                print("🔎 Raw response remains above.")
            break


def chat_with_assistant(assistant):
    thread_id = choose_thread(assistant.id)
    print("💬 Enter chat mode. Type 'exit' to quit.")
    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            break

        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=user_input
        )

        run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=assistant.id)
        while True:
            run_status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if run_status.status == "completed":
                break
            elif run_status.status == "failed":
                print("❌ GPT Run failed.")
                print(f"🔍 Reason: {run_status.last_error}")
                return
            time.sleep(2)

        messages = client.beta.threads.messages.list(thread_id=thread_id, order="desc")
        for msg in messages.data:
            if msg.role == "assistant":
                print("Assistant:", msg.content[0].text.value)
                handle_sandbox_file_links(msg.content[0].text.value)
                break


if __name__ == "__main__":
    assistant = select_or_create_assistant()
    action = input("Choose action → 1: Send database | 2: Chat (1/2): ").strip()

    if action == "1":
        send_database_to_assistant(assistant)
    elif action == "2":
        chat_with_assistant(assistant)
    else:
        print("❌ Invalid choice.")
