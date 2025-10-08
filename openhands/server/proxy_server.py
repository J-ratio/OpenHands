import asyncio
import logging

import httpx
import websockets
from fastapi import FastAPI, Request, WebSocket
from fastapi.responses import Response

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.api_route(
    '/{port}/{path:path}', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
)
async def proxy_http(request: Request, port: int, path: str):
    """Proxies normal HTTP requests to localhost:<port>"""
    target_url = f'http://localhost:{port}/{path}'

    async with httpx.AsyncClient() as client:
        method = request.method
        headers = dict(request.headers)
        body = await request.body()
        resp = await client.request(
            method,
            target_url,
            follow_redirects=True,
            headers=headers,
            content=body,
            params=request.query_params,
        )

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers=dict(resp.headers),
            media_type=resp.headers.get('content-type'),
        )


@app.websocket('/{port}/{path:path}')
async def proxy_ws(websocket: WebSocket, port: int, path: str):
    """Proxies WebSocket connections for VS Code web client."""
    await websocket.accept()

    # Build target URL with query parameters
    query_string = str(websocket.url.query) if websocket.url.query else ''
    target_url = f'ws://localhost:{port}/{path}'
    if query_string:
        target_url += f'?{query_string}'

    logger.debug(f'WebSocket proxy: {target_url}')

    try:
        async with websockets.connect(target_url) as target_ws:

            async def client_to_target():
                try:
                    while True:
                        message = await websocket.receive()
                        if isinstance(message, dict) and 'text' in message:
                            await target_ws.send(message['text'])
                        elif isinstance(message, dict) and 'bytes' in message:
                            await target_ws.send(message['bytes'])
                except Exception as e:
                    logger.exception(f'Client to target error: {e}')
                    await target_ws.close()

            async def target_to_client():
                try:
                    async for msg in target_ws:
                        await websocket.send_text(msg)
                except Exception as e:
                    logger.error(f'Target to client error: {e}')
                    await websocket.close()

            await asyncio.gather(client_to_target(), target_to_client())
    except Exception as e:
        logger.error(f'WebSocket proxy error: {e}')
        await websocket.close()


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8002)
