from fastapi import FastAPI, Request
from models import TickInfo
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Dict
import uvicorn
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

app = FastAPI()
tickdata: list[TickInfo] = []

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logging.error(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

#create endpoint to get tick from mt5 terminal 
@app.post("/price")
async def TickData(data:list[TickInfo]):
    global tickdata
    tickdata = data
    # print(f"Data: ", data)
    for tick in data: 
        print(f"Recieved {tick.symbol} with {tick.bid}")
    return {"message":f"{len(data)} ticks recieved successfully"}

#endpoint to get tick from api for frontend
@app.get("/price/data")
async def GetTick():
    return tickdata

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)