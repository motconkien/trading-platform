from fastapi import FastAPI, Request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Dict
import models.sqlalchemy.models as models
import utils.handle_db as handle_db
import uvicorn
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from routers import prices, symbols
import shutil
import os 


app = FastAPI()
app.include_router(prices.router)
app.include_router(symbols.router)

def remove_pycache(start_dir="."):
    for root, dirs, files in os.walk(start_dir):
        for d in dirs:
            if d == '__pycache__':
                shutil.rmtree(os.path.join(root, d))

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

remove_pycache()

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)


