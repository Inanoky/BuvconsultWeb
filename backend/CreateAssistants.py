from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


assistant = client.beta.assistants.create(
  name="Math Tutor",
  instructions="You are a personal math tutor. Write and run code to answer math questions.",
  tools=[{"type": "code_interpreter"}],
  model="gpt-4.1",
)

print(f"Assistant is : {assistant}")

thread = client.beta.threads.create()

print(thread)

message = client.beta.threads.messages.create(
  thread_id=thread.id,
  role="user",
  content=input("Enter your question")
)

print(message)