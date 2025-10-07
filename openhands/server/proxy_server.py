import httpx
from fastapi import FastAPI, Request
from fastapi.responses import Response

app = FastAPI()


@app.api_route(
    '/{port}/{path:path}', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
)
async def proxy_http(request: Request, port: int, path: str):
    """Proxies normal HTTP requests to localhost:<port>"""
    target_url = f'http://localhost:{port}{path}'

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


# @app.websocket("/{port}/{path:path}")
# async def proxy_ws(websocket: WebSocket, port: int, path: str):
#     """Proxies WebSocket connections for VS Code web client."""
#     await websocket.accept()
#     target_url = f"ws://hub.h2loop.ai:{port}/{path}"

#     async with websockets.connect(target_url) as target_ws:
#         async def client_to_target():
#             try:
#                 while True:
#                     msg = await websocket.receive_text()
#                     await target_ws.send(msg)
#             except:
#                 await target_ws.close()

#         async def target_to_client():
#             try:
#                 async for msg in target_ws:
#                     await websocket.send_text(msg)
#             except:
#                 await websocket.close()

#         await asyncio.gather(client_to_target(), target_to_client())


if __name__ == '__main__':
    import uvicorn

    uvicorn.run(app, host='0.0.0.0', port=8002)
