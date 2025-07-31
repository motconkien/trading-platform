from sqlalchemy import Column, String, Float, Integer, VARCHAR, DATETIME
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class TickInfoDB(Base):
    __tablename__ = "tick"
    id = Column(Integer, primary_key=True, index=True)
    account = Column(VARCHAR(255))
    symbol = Column(VARCHAR(255))
    bid = Column(Float)
    ask = Column(Float)
    spread = Column(Integer)
    swap_long = Column(Float)
    swap_short = Column(Float)
    date = Column(DATETIME)

class SymbolInfoDB(Base):
    __tablename__ = "symbol"
    id = Column(Integer, primary_key=True, index=True)
    account = Column(VARCHAR(255))
    symbol = Column(VARCHAR(255))
    contractsize = Column(Integer)
    stop_level = Column(Float)
    digits = Column(Integer)
