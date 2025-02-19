# Gurdjieff Teachings Chat

A FastAPI-based chat application that connects to Abacus AI to provide insights about Gurdjieff's teachings.

## Features

- Interactive chat interface
- Real-time responses from Abacus AI
- Clean, responsive design
- Loading state indicators
- Error handling

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: HTML, CSS, JavaScript
- AI: Abacus AI API
- Server: Uvicorn
- Deployment: Render

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/tmbewley/enneagramai.git
cd enneagramai
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

4. Visit `http://localhost:8000` in your browser

## API Endpoints

- `GET /` - Serves the main chat interface
- `POST /api/chat` - Handles chat messages and returns AI responses

## Deployment

The application is configured for deployment on Render using the provided `render.yaml` configuration. The deployment will automatically:

1. Install Python dependencies (including uvicorn)
2. Start the FastAPI server using uvicorn
3. Serve the static files and handle API requests

No additional configuration is needed as everything is specified in the render.yaml file.
