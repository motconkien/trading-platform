from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from database.databases import get_db
from models.sqlalchemy.models import *
from models.pydantic.schemas import *
from utils.handle_db import update_all_symbol
from models.pydantic.schemas import SymbolInfo, SymbolResponse

router = APIRouter()

symboldata: list[SymbolInfo] = []
#create enddpoint to get symbol info
@router.post("/symbol", response_model=SymbolResponse)
async def SymbolData(data:list[SymbolInfo]):
    global symboldata
    symboldata = data 
    for sym in symboldata:
        print(f"Receive symbol {sym.symbol} with info")
    #update_all_symbol(symboldata)
    return {"message": f"{len(data)} ticks received successfully"}

@router.get("/symbol/data")
async def GetSym():
    return symboldata