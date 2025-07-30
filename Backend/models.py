from pydantic import BaseModel, Field

class TickInfo(BaseModel):
    account: str
    symbol: str
    bid: float
    ask: float
    spread: int
    date:str


