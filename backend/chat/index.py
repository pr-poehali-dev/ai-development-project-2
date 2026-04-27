import json
import os
import http.client


def handler(event, context) -> dict:
    """Отправляет сообщение в OpenRouter (Claude) и возвращает ответ ИИ."""

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

    payload = json.dumps({
        "model": "anthropic/claude-3.5-haiku",
        "messages": api_messages,
        "max_tokens": 1024,
        "temperature": 0.7,
    }).encode("utf-8")

    api_key = os.environ.get('OPENROUTER_API_KEY', '').strip()
    auth_header = ("Bearer " + api_key).encode("latin-1", errors="replace").decode("latin-1")

    conn = http.client.HTTPSConnection("openrouter.ai", timeout=25)
    conn.request(
        "POST",
        "/api/v1/chat/completions",
        body=payload,
        headers={
            "Authorization": auth_header,
            "Content-Type": "application/json",
            "Content-Length": str(len(payload)),
        },
    )
    resp = conn.getresponse()
    raw = resp.read().decode("utf-8")
    conn.close()

    result = json.loads(raw)

    if "choices" not in result:
        error_msg = result.get("error", {}).get("message", raw[:200])
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({"reply": "Ошибка: " + error_msg})
        }

    reply = result["choices"][0]["message"]["content"].strip()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({"reply": reply})
    }
