# Speed Test App

FastAPI-based internet speed test app with frontend and backend in one deployable project.

## Deploy on Render
1. Push this folder to a GitHub repo.
2. Create a new Web Service on Render.
3. Connect the repo.
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Local run
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```
