from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from models.pydantic.schemas import OhlcInfo, OhlcResponse
from utils.handle_db import update_all_ohlc
from typing import Dict, List
import logging

router = APIRouter()

#saample coming data
"""
{
    account: {
        "symbol1": {[
            "open": 1.2345,
            "close": 1.2346,
            "high": 1.2347,
            "low": 1.2344,
            "date": "2023-10-01"],...
        },
    
}
"""
router = APIRouter()
ohlcdata: Dict[str, dict[str,OhlcInfo]] = {}

@router.post("/ohlc", response_model=OhlcResponse)
async def OhlcData(data: Dict[str,dict[str,OhlcInfo]]):
    flattened_data = []

    try:
        for account,symbols in data.items():
            if account not in ohlcdata:
                ohlcdata[account] = {}
            
            for symbol,info in symbols.items():
                if symbol not in ohlcdata[account]:
                    ohlcdata[account][symbol] = info
                flattened_data.append({
                    "account":account,
                    "symbol":symbol,
                    **info.dict()
                })
                
    except Exception as e:
        logging.error(f"Error processing OHLC data: {e}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

@router.get("ohlc/data", response_model=Dict[str,dict[str,List[OhlcInfo]]])
async def GetOhlc():
    return ohlcdata