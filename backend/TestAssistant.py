from openai import OpenAI
from config import OPENAI_API_KEY
import time
import json

# Initialize client
client = OpenAI(api_key=OPENAI_API_KEY)

# Assistant and thread IDs
thread_id = 'thread_p1TjJQrrFK3Rh0cfgQgVnIAl'
assistant_id = 'asst_UC3fchIcLjq92bRbY1DlTIEO'

# Get user input
user_message = input("You: ")

# Step 1: Send user message to the thread
try:
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_message
    )
    print("Message sent successfully.\n")
except Exception as e:
    print(f"Error sending message: {e}")
    exit()

# Step 2: Start a run
try:
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=assistant_id
    )
    print("Run started.\n")
except Exception as e:
    print(f"Error starting run: {e}")
    exit()

# Step 3: Poll the run until it completes
print("Waiting for run to complete...")
while True:
    try:
        run_status = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )
    except Exception as e:
        print(f"Error retrieving run status: {e}")
        exit()

    print(f"Run status: {run_status.status}")
    if run_status.status == "completed":
        print("Run completed.\n")
        break
    elif run_status.status in ["failed", "cancelled", "expired"]:
        print(f"Run did not complete successfully: {run_status.status}")
        print("Run output:\n", json.dumps(run_status.model_dump(), indent=2))
        exit()
    time.sleep(1)

# Step 4: Retrieve and print all messages in the thread
try:
    messages = client.beta.threads.messages.list(thread_id=thread_id)
except Exception as e:
    print(f"Error retrieving messages: {e}")
    exit()

print("\n=== ALL MESSAGES IN THREAD ===")
for msg in reversed(messages.data):  # print oldest to newest
    print(f"\n[{msg.role.upper()}] {msg.created_at}")
    for part in msg.content:
        if part.type == "text":
            print(part.text.value)
        else:
            print(f"(Non-text content: {part})")

# Step 5: Print the latest assistant response only (if needed)
print("\n=== LATEST ASSISTANT REPLY ===")
for msg in messages.data:
    if msg.role == "assistant":
        if msg.content and msg.content[0].type == "text":
            print(msg.content[0].text.value)
        else:
            print("Assistant response was empty or not text.")
        break
