import sys
from database import databases
from datetime import datetime
import logging
from models.sqlalchemy.models import TickInfoDB, SymbolInfoDB

sys.dont_write_bytecode=True
def update_all_tick(tick_data):
    session = next(databases.get_db())
    for tick in tick_data:
        date = datetime.strptime(tick.date,"%Y.%m.%d %H:%M:%S")


        existing = session.query(TickInfoDB).filter( #type:ignore
           TickInfoDB.symbol ==tick.symbol,
            TickInfoDB.date == date
        ).first()

        #need to change to get instead of calling directly
        if existing:
            existing.bid = tick.bid
            existing.ask = tick.ask
            existing.spread = tick.spread
        else:
            new_tick = TickInfoDB( 
                account = tick.account,  # type: ignore
                symbol = tick.symbol,  # type: ignore
                bid = tick.bid,  # type: ignore
                ask = tick.ask,  # type: ignore
                spread = tick.spread,  # type: ignore
                swap_long = tick.swap_long,  # type: ignore
                swap_short = tick.swap_short,  # type: ignore
                date = date # type: ignore
            )
            session.add(new_tick)
    try:
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(f"Error committing session: {e}")
    finally:
        session.close()

def update_all_symbol(symbol_data):
    session = next(databases.get_db())
    for sym in symbol_data:
        existing = session.query(SymbolInfoDB).filter( #type:ignore
            SymbolInfoDB.symbol == sym["symbol"],
            SymbolInfoDB.account == sym["account"]
        ).first()

        if existing:
            existing.contractsize = sym["contractsize"]
            existing.stop_level = sym["stop_level"]
            existing.digits = sym["digits"]
        else:
            new_sym = SymbolInfoDB( 
                account = sym["account"], #type:ignore
                symbol = sym["symbol"], #type:ignore
                contractsize = sym["contractsize"], #type:ignore
                stop_level = sym["stop_level"], #type:ignore
                digits = sym["digits"] #type:ignore
            )
            session.add(new_sym)
    try:
        session.commit()
    except Exception as e: 
        session.rollback()
        logging.error(f"Error committing session: {e}")
    finally:
        session.close()