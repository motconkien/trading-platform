from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from utils.handle_db import update_all_tick
from models.pydantic.schemas import TickInfo, TickResponse
from typing import List, Dict
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('logs/price.log'),
        logging.StreamHandler()
    ]
)

router = APIRouter()

tickdata: Dict[str,dict[str,TickInfo]] = {}
# POST endpoint to receive tick data
@router.post("/price", response_model=TickResponse)
async def TickData(data: Dict[str, Dict[str, TickInfo]],request:Request):
    global tickdata
    # print("Raw data: ", data)
    flattened_data =[]
    try:
        for acc,ticks in data.items():
            if acc not in tickdata:
                tickdata[acc] = {}

            for sym, tick_data in ticks.items():
                tickdata[acc][sym] = tick_data
            
            #flatten data for database 
            for sym, tick in ticks.items():
                flattened_data.append(
                    {
                        "account":acc,
                        "symbol":sym,
                        **tick.dict()
                    }
                )
        # print(flattened_data)
        logging.info(f"{sum(len(ticks) for ticks in data.values())} ticks received successfully")
        return {"message": f"{sum(len(ticks) for ticks in data.values())} ticks received successfully"}
    except Exception as e: 
        return JSONResponse(content={"error":str(e)}, status_code=400)

# GET endpoint to return stored tick data
@router.get("/price/data", response_model=Dict[str,Dict[str,TickInfo]])
async def GetTick():
    return tickdata