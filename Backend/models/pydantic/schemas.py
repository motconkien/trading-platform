from pydantic import BaseModel, Field

#validate data for receive 
class TickInfo(BaseModel):
    # account: str
    # symbol: str
    bid: float
    ask: float
    spread: int
    swap_long:float
    swap_short:float
    date:str
   
class TickResponse(BaseModel):
    message:str

class SymbolInfo(BaseModel):
    account:str
    symbol:str
    contractsize:int
    stop_level:float
    digits:int

class SymbolResponse(BaseModel):
    message:str

class OhlcInfo(BaseModel):
    # account:str
    # symbol:str
    open:float
    close:float
    high:float
    low:float
    date:str

class OhlcResponse(BaseModel):
    message:str
