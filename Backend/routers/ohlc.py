from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from models.pydantic.schemas import OhlcInfo, OhlcResponse
from utils.handle_db import update_all_ohlc, query_ohlc_history
from typing import Dict, List
import logging
from connections.socketcon import SocketConnection
from fastapi import WebSocket, WebSocketDisconnect
import json
import asyncio


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
manager = SocketConnection()
ohlcdata: Dict[str, dict[str,dict]] = {}

@router.post("/ohlc", response_model=OhlcResponse)
async def OhlcData(data: Dict[str,dict[str,OhlcInfo]]):
    flattened_data = []

    try:
        for account,symbols in data.items():
            if account not in ohlcdata:
                ohlcdata[account] = {}
            
            for symbol,info in symbols.items():
                if symbol not in ohlcdata[account]:
                    ohlcdata[account][symbol] = info.dict()
                flattened_data.append({
                    "account":account,
                    "symbol":symbol,
                    **info.dict()
                })
        # print(flattened_data)
        update_all_ohlc(flattened_data)
        logging.info(f"Received {len(flattened_data)} OHLC data points")
        return {"message":"Receive ohlc data successfully"}
                
    except Exception as e:
        logging.error(f"Error processing OHLC data: {e}")
        return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

@router.get("/ohlc/data", response_model=Dict[str,dict[str,OhlcInfo]])
async def GetOhlc():
    return ohlcdata

# query data from db to show chart on frontend
@router.get('/ohlc/history/{account}/{symbol}/{limit}', response_model=list[OhlcInfo])
async def get_ohlc_history(account:str, symbol:str, limit:int =100):
    return query_ohlc_history(account,symbol,limit)

#receive the send to all ws endpoints
# @router.on_event("startup")
# async def start_broadcast2():
#     async def broadcast_ohlc_data():
#         previous_data = None
#         while True:
#             print("Broadcasting OHLC data:", ohlcdata)
#             json_data = json.dumps(ohlcdata)
#             if json_data != previous_data:
#                 await manager.broadcast(json_data)
#                 previous_data = json_data
#             await asyncio.sleep(1)
#     asyncio.create_task(broadcast_ohlc_data())

# @router.websocket("/ws/ohlc")
# async def websocket_endpoint(websocket: WebSocket):
#     await manager.connect(websocket)
#     try:
#         while True:
#             # await websocket.receive_text()
#             await asyncio.sleep(1)
#     except WebSocketDisconnect:
#         manager.disconnect(websocket)
#         logging.info("WebSocket disconnected")
#     except Exception as e:
#         logging.error(f"WebSocket error: {e}")