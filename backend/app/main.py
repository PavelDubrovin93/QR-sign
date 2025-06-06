import logging

import uvicorn
from environs import Env
from fastapi import APIRouter, FastAPI, HTTPException, Request

from app.api.main import api_router
from app.infrastructure.exception_handler import global_exception_handler
from app.infrastructure.init_db import init_db
from app.infrastructure.logger import logger

env = Env()
env.read_env()
logging.basicConfig(level=logging.INFO)


main_router = APIRouter()
main_router.include_router(api_router)

app = FastAPI()
app.include_router(main_router, prefix="/api")
app.add_exception_handler(Exception, global_exception_handler)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.detail} - {exc.status_code}")
    return await global_exception_handler(request, exc)


@app.on_event("startup")
async def on_startup():
    await init_db()


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
