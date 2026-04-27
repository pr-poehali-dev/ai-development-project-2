import json
import os
import requests


def handler(event, context) -> dict:
    """Отправляет сообщение в OpenRouter и возвращает ответ ИИ для чата Kruel AI."""

    if not isinstance(event, dict):
        try:
            event = json.loads(str(event))
        except Exception:
            event = {}

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': ''
        }

    body = event.get('body') or {}
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    if not isinstance(body, dict):
        body = {}

    messages = body.get('messages', [])
    kids_mode = body.get('kidsMode', False)

    if kids_mode:
        system_prompt = "You are Kruel AI, a friendly assistant for children. Always respond in Russian. Use simple, kind words. No adult content."
    else:
        system_prompt = "You are Kruel AI, a smart and helpful assistant. Always respond in Russian. Be concise, accurate, and helpful."

    api_messages = [{"role": "system", "content": system_prompt}] + messages

    api_key = os.environ.get('OPENROUTER_API_KEY', '')

    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        data=json.dumps({
            "model": "mistralai/mistral-7b-instruct:free",
            "messages": api_messages,
            "max_tokens": 1024,
            "temperature": 0.7,
        }).encode("utf-8"),
        timeout=25,
    )

    result = resp.json()
    print("OpenRouter response:", result)

    if "choices" not in result:
        error_msg = result.get("error", {}).get("message", str(result))
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"reply": f"Ошибка API: {error_msg}"})
        }

    reply = result["choices"][0]["message"]["content"].strip()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({"reply": reply})
    }
