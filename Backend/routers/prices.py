from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from models.pydantic.schemas import TickInfo, TickResponse
from typing import List, Dict
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from utils.handle_db import update_all_tick

    
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('logs/price.log'),
        logging.StreamHandler()
    ]
)
logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.ERROR)


# Credentials for Google Sheets API
service_account_info = {
    "service_account_file":"crenditals.json",
    "scopes": ["https://www.googleapis.com/auth/spreadsheets"],
    "spreadsheet_id": "15glnxvLJAy7Z9rqXjq2IP3JzxbRN4xA8l2cvO68Ypcw",
    "sheet-name": "TickData"
}

cred = service_account.Credentials.from_service_account_file(
    service_account_info["service_account_file"],
    scopes=service_account_info["scopes"]
)

#read before adding new data
def read_data():
    service = build("sheets", "v4", credentials=cred)
    result = service.spreadsheets().values().get(
        spreadsheetId=service_account_info["spreadsheet_id"],
        range=f"{service_account_info['sheet-name']}!A:Z"
    ).execute()
    return result.get("values", [])

def map_to_tick_info():
    data = read_data()
    existing = {}
    for i, row in enumerate(data):
        if len(row) > 2:
            account,symbol = row[0], row[1]
            existing[(account, symbol)] = i + 2

    return existing

def split_data(existing, flattened_data):
    updates = []
    appends = []
    for item in flattened_data:
        key = (item["account"], item["symbol"])
        row_values = [
            item.get("account", ""),
            item.get("symbol", ""),
            item.get("bid", ""),
            item.get("ask", ""),
            item.get("spread", ""),
            item.get("swap_long", ""),
            item.get("swap_short", ""),
            item.get("date", ""),
        ]
        if key in existing:
            row_num = existing[key]
            updates.append((row_num, row_values))  
        else:
            appends.append(row_values)
    return updates, appends


#function to update Google Sheets with tick data
def update_google_sheet(data, type: str):
    service = build("sheets", "v4", credentials=cred)
    
    if type == "append":
        service.spreadsheets().values().append(
            spreadsheetId=service_account_info["spreadsheet_id"],
            range=f"{service_account_info['sheet-name']}!A1",
            valueInputOption="RAW",
            body={"values": data}
        ).execute()

    elif type == "update":
        for row_num, row_data in data:
            service.spreadsheets().values().update(
                spreadsheetId=service_account_info["spreadsheet_id"],
                range=f"{service_account_info['sheet-name']}!A{row_num}:H{row_num}",
                valueInputOption="RAW",
                body={"values": [row_data]}
            ).execute()



#function to route
router = APIRouter()

tickdata: Dict[str,dict[str,TickInfo]] = {}
# POST endpoint to receive tick data
@router.post("/price", response_model=TickResponse)
async def TickData(data: Dict[str, Dict[str, TickInfo]],request:Request):
    global tickdata
    # print("Raw data: ", data)
    flattened_data =[]
    
    service = build("sheets", "v4", credentials=cred)
    existing = map_to_tick_info()
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
                bid = tick.bid if tick.bid is not None else 0.0
                ask = tick.ask if tick.ask is not None else 0.0
                spread = tick.spread if tick.spread is not None else 0.0
                swap_long = tick.swap_long if tick.swap_long is not None else 0.0
                swap_short = tick.swap_short if tick.swap_short is not None else 0.0
                date = tick.date if tick.date is not None else ""
                if (acc,sym) in existing:
                    print(f"Updating existing tick data for {acc} - {sym}")
                    # update.append([acc, sym, bid, ask, spread, swap_long, swap_short, date])
                    
                    service.spreadsheets().values().update(
                            spreadsheetId=service_account_info["spreadsheet_id"],
                            range=f"{service_account_info['sheet-name']}!A{existing[(acc,sym)]}:H{existing[(acc,sym)]}",
                            valueInputOption="RAW",
                            body={"values": [[acc, sym, bid, ask, spread, swap_long, swap_short, date]]}
                        ).execute()
                    print("Updated existing tick data for", acc, sym)
                else:
                    print(f"Appending new tick data for {acc} - {sym}")
                    service.spreadsheets().values().append(
                            spreadsheetId=service_account_info["spreadsheet_id"],
                            range=f"{service_account_info['sheet-name']}!A2",
                            valueInputOption="RAW",
                            body={"values": [[acc, sym, bid, ask, spread, swap_long, swap_short, date]]}
                        ).execute()
                    print("Added tick data for", acc, sym)
        #update all tick data in database

       


        logging.info(f"{sum(len(ticks) for ticks in data.values())} ticks received successfully")
        return {"message": f"{sum(len(ticks) for ticks in data.values())} ticks received successfully"}
    except Exception as e: 
        return JSONResponse(content={"error":str(e)}, status_code=400)

# GET endpoint to return stored tick data
@router.get("/price/data", response_model=Dict[str,Dict[str,TickInfo]])
async def GetTick():
    return tickdata