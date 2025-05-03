def clean_gpt_json_response(response_text: str) -> str:
    """
    Strips GPT response down to just the JSON.

    Args:
        response_text (str): The raw GPT output (usually wrapped in ```json ... ```).

    Returns:
        str: Clean JSON string ready for json.loads().
    """
    # Remove markdown wrapping if present
    if response_text.strip().startswith("```json"):
        response_text = response_text.strip()
        response_text = response_text.removeprefix("```json").removesuffix("```").strip()

    return response_text