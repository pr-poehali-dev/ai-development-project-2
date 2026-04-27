import json
import os
import http.client
import boto3
import base64
import uuid
import time


def handler(event, context) -> dict:
    """Генерирует изображение по описанию через FLUX и сохраняет в S3."""

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

    prompt = body.get('prompt', '').strip()
    if not prompt:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'prompt is required'})
        }

    api_key = os.environ.get('OPENROUTER_API_KEY', '').strip()
    api_key_ascii = api_key.encode('ascii', errors='ignore').decode('ascii')

    payload = json.dumps({
        "model": "black-forest-labs/flux-schnell:free",
        "prompt": prompt,
        "n": 1,
        "size": "1024x1024",
    }).encode('utf-8')

    conn = http.client.HTTPSConnection("openrouter.ai", timeout=55)
    conn.request(
        "POST",
        "/api/v1/images/generations",
        body=payload,
        headers={
            "Authorization": "Bearer " + api_key_ascii,
            "Content-Type": "application/json",
            "Content-Length": str(len(payload)),
        },
    )
    resp = conn.getresponse()
    raw = resp.read().decode('utf-8')
    conn.close()

    result = json.loads(raw)

    if 'data' not in result or not result['data']:
        error_msg = result.get('error', {}).get('message', raw[:300])
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': error_msg})
        }

    image_url = result['data'][0].get('url', '')
    b64_data = result['data'][0].get('b64_json', '')

    if b64_data:
        image_bytes = base64.b64decode(b64_data)
    elif image_url:
        img_conn = http.client.HTTPSConnection(image_url.split('/')[2], timeout=30)
        path = '/' + '/'.join(image_url.split('/')[3:])
        img_conn.request("GET", path)
        img_resp = img_conn.getresponse()
        image_bytes = img_resp.read()
        img_conn.close()
    else:
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No image data returned'})
        }

    filename = f"ai-images/{int(time.time())}-{uuid.uuid4().hex[:8]}.png"

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(
        Bucket='files',
        Key=filename,
        Body=image_bytes,
        ContentType='image/png',
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{filename}"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'url': cdn_url})
    }
