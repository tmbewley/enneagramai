from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from abacusai import ApiClient
import json

app = FastAPI()

# Mount static files (your HTML)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.post("/api/chat")
async def chat(request: Request):
    try:
        # Get the message from the request
        body = await request.json()
        message = body.get('message')
        
        if not message:
            return JSONResponse(
                status_code=400,
                content={'error': 'Message is required'}
            )
        
        # Initialize Abacus client with API key
        client = ApiClient(api_key="0cbb8291c9004289852723a4b6a70507")
        
        # Get chat response
        response = client.get_chat_response(
            deployment_id='9b9bee200',
            deployment_token='bb125418e88d4ab6a5b6ebc95b707468',
            messages=[{
                "is_user": True,
                "text": message
            }]
        )
        
        return JSONResponse(content=response)
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={'error': str(e)}
        )

# Root route to serve the HTML
@app.get("/")
async def root():
    return FileResponse("app/static/index.html")
