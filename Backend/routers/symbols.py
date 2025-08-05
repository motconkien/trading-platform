from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict
from database.databases import get_db
from models.sqlalchemy.models import *
from models.pydantic.schemas import *
from utils.handle_db import update_all_symbol
from models.pydantic.schemas import SymbolInfo, SymbolResponse

router = APIRouter()

symboldata: Dict[str,list[SymbolInfo]] = {}
#create enddpoint to get symbol info
@router.post("/symbol", response_model=SymbolResponse)
async def SymbolData(data:Dict[str,list[SymbolInfo]]):
    global symboldata
    symboldata = data 
    flattend_data = []
    for account, symbols in data.items():
        for symbol in symbols:
            flattend_data.append({
                "account": account,
                "symbol": symbol.symbol,
                **symbol.dict()})
    # print(flattend_data)
    # update_all_symbol(flattend_data)
    return {"message": f"{len(data)} ticks received successfully"}

@router.get("/symbol/data")
async def GetSym():
    return symboldata