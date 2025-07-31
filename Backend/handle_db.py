import sys
import models
import databases
from datetime import datetime
import logging


sys.dont_write_bytecode=True
def update_all_tick(tick_data):
    session = databases.create_new_session()
    for tick in tick_data:
        date = datetime.strptime(tick.date,"%Y.%m.%d %H:%M:%S")


        existing = session.query(models.TickInfoDB).filter(
            models.TickInfoDB.symbol ==tick.symbol,
            models.TickInfoDB.date == date
        ).first()

        #need to change to get instead of calling directly
        if existing:
            existing.bid = tick.bid
            existing.ask = tick.ask
            existing.spread = tick.spread
        else:
            new_tick = models.TickInfoDB(
                account = tick.account,
                symbol = tick.symbol,
                bid = tick.bid,
                ask = tick.ask,
                spread = tick.spread,
                swap_long = tick.swap_long,
                swap_short = tick.swap_short,
                date = date
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
    session = databases.create_new_session()
    for sym in symbol_data:
        existing = session.query(models.SymbolInfoDB).filter(
            models.SymbolInfoDB.symbol == sym.symbol,
            models.SymbolInfoDB.account == sym.account
        ).first()

        if existing:
            existing.contractsize = sym.contractsize
            existing.stop_level = sym.stop_level
            existing.digits = sym.digits
        else:
            new_sym = models.SymbolInfoDB(
                account = sym.account,
                symbol = sym.symbol,
                contractsize = sym.contractsize,
                stop_level = sym.stop_level,
                digits = sym.digits
            )
            session.add(new_sym)
    try:
        session.commit()
    except Exception as e: 
        session.rollback()
        logging.error(f"Error committing session: {e}")
    finally:
        session.close()