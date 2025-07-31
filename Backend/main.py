from fastapi import FastAPI, Request
from schemas import TickInfo, SymbolInfo
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from typing import Dict
import models
import handle_db
import uvicorn
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging



app = FastAPI()
tickdata: list[TickInfo] = []
symboldata: list[SymbolInfo] = []


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
    for tick in data: 
        print(f"Recieved {tick.symbol} with {tick.bid}")
    print("Update database processing")
    handle_db.update_all_tick(tickdata)
    return {"message":f"{len(data)} ticks recieved successfully"}

#endpoint to get tick from api for frontend
@app.get("/price/data")
async def GetTick():
    return tickdata


#create enddpoint to get symbol info
@app.post("/symbol")
async def SymbolData(data:list[SymbolInfo]):
    global symboldata
    symboldata = data 
    for sym in symboldata:
        print(f"Receive symbol {sym.symbol} with info")
    handle_db.update_all_symbol(symboldata)
    return {"message":f"{len(data)} ticks recieved successfully"}

@app.get("/symbol/data")
async def GetSym():
    return symboldata

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)


