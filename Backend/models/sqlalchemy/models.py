from sqlalchemy import Column, String, Float, Integer, VARCHAR, DATETIME
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import UniqueConstraint
from database.databases import Base


# Base = declarative_base()


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

    __table_args__ = (
        UniqueConstraint('symbol', 'date', name='uniq_account_symbol_date'),
    )

class SymbolInfoDB(Base):
    __tablename__ = "symbol"
    id = Column(Integer, primary_key=True, index=True)
    account = Column(VARCHAR(255))
    symbol = Column(VARCHAR(255))
    contractsize = Column(Integer)
    stop_level = Column(Float)
    digits = Column(Integer)

# for candle stick
class OhlcDB(Base):
    __tablename__ = "ohlc"
    id = Column(Integer, primary_key=True, index=True)
    account = Column(VARCHAR(255))
    symbol = Column(VARCHAR(255))
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    date = Column(DATETIME)

    __table_args__ = (
        UniqueConstraint('symbol','date', name='uniq_symbol_date'),
    )

