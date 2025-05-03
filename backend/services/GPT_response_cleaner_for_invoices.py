import re

def clean_gpt_invoice_response(response_text: str) -> list[list[str]]:
    """
    Extracts and sanitizes rows of data from GPT response containing invoice table information.
    Handles string-escaped lists, filters invalid entries, and strips whitespace.
    """
    # Match bracketed rows from the GPT response
    pattern = re.compile(r"\[\s*(?:\[.*?\]|'.*?'|\".*?\"|[^'\"])*?\]", re.DOTALL)
    matches = pattern.findall(response_text)

    cleaned_rows = []

    for match in matches:
        try:
            # Evaluate the string safely
            row = eval(match, {"__builtins__": None}, {})
            if isinstance(row, list):
                # Ensure row elements are clean strings (fallback to empty string)
                cleaned_row = [str(i).strip() if i is not None else '' for i in row]
                cleaned_rows.append(cleaned_row)
        except Exception:
            continue  # Skip broken evaluations

    return cleaned_rows
