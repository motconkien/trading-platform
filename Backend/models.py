from pydantic import BaseModel, Field

class TickInfo(BaseModel):
    account: str
    symbol: str
    bid: float
    ask: float
    spread: int
    swap_long:float
    swap_short:float
    date:str

    #swap_long. swap_short,

class SymbolInfo(BaseModel):
    account:str
    symbol:str
    contractsize:int
    stop_level:float
    digits:int
     #symbol, contractsize, stop_level, digits
