from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .routes.web import router as web_router
from .routes.api import router as api_router

app = FastAPI(title="Speed Test App")
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(web_router)
app.include_router(api_router, prefix="/api")