import sys
from database import databases
from datetime import datetime
from sqlalchemy import text
import logging
from models.sqlalchemy.models import TickInfoDB, SymbolInfoDB, OhlcDB

sys.dont_write_bytecode=True
def update_all_tick(tick_data):
    session = next(databases.get_db())
    values = [
        {
            "account": tick["account"],
            "symbol": tick["symbol"],
            "bid": tick["bid"],
            "ask": tick["ask"],
            "spread": tick["spread"],
            "swap_long": tick["swap_long"],
            "swap_short": tick["swap_short"],
            "date": datetime.strptime(tick['date'], "%Y.%m.%d %H:%M:%S")
        }
        for tick in tick_data
    ]
    sql = """
    INSERT INTO tick (account, symbol, bid, ask, spread, swap_long, swap_short, date)
    VALUES (:account, :symbol, :bid, :ask, :spread, :swap_long, :swap_short, :date)
    ON DUPLICATE KEY UPDATE
        bid = VALUES(bid),
        ask = VALUES(ask),
        spread = VALUES(spread),
        swap_long = VALUES(swap_long),
        swap_short = VALUES(swap_short)
    """

    try:
        session.execute(text(sql), values)
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

def update_all_ohlc(ohlc_data):
    session = next(databases.get_db())
    value = [{
        "account": info['account'],
        "symbol": info["symbol"],
        "open": info["open"],
        "high": info["high"],
        "low": info["low"],
        "close": info["close"],
        "date": datetime.strptime(info["date"], "%Y.%m.%d %H:%M:%S")
    } for info in ohlc_data]
    
    sql = """
    INSERT INTO ohlc (account, symbol, open, high, low, close, date)
    VALUES (:account, :symbol, :open, :high, :low, :close, :date)
    ON DUPLICATE KEY UPDATE
        open = VALUES(open),
        high = VALUES(high),
        low = VALUES(low),
        close = VALUES(close)
    """
    
    try:
        session.execute(text(sql), value)
        session.commit()
    except Exception as e:
        session.rollback()
        logging.error(f"Error committing session: {e}")
    finally:
        session.close()

def query_ohlc_history(account: str, symbol: str, limit: int = 100):
    session = next(databases.get_db())
    sql ="""

    SELECT account,symbol, open, high, low, close, date FROM ohlc where account = :account and symbol = :symbol
    ORDER BY date DESC LIMIT :limit
    """
    try:
        result = session.execute(text(sql), {"account":account, "symbol": symbol, "limit":limit})
        rows = result.fetchall()
        print("Fetched rows:", rows) 
        ohlc_history = [
            {"open":row[2],
            "high":row[3],
            "low":row[4],
            "close":row[5],
            "date":row[6].strftime("%Y-%m-%d %H:%M:%S")} 
            for row in rows]
        
        return ohlc_history
    except Exception as e:
        print(f"Error querying OHLC history: {e}")
        return []
    finally:
        session.close()
    
def query_tick_history(account: str, symbol:str, limit: int = 100):
    session = next(databases.get_db())
    sql = """

    SELECT bid,ask,spread,swap_long,swap_short,date from tick where account = :account and symbol = :symbol
    Order by date DESC limit :limit
    """

    try: 
        result = session.execute(text(sql), {"account":account, "symbol":symbol, "limit":limit})
        rows = result.fetchall()
        # print(rows)
        tick_history = [
            {
                "bid":row[0],
                "ask":row[1],
                "spread":row[2],
                "swap_long":row[3],
                "swap_short":row[4],
                "date":row[5].strftime("%Y-%m-%d %H:%M:%S")
            } for row in rows
        ]
        return tick_history
    except Exception as e:
        print(f"Error query tick history: {e}")
        return []
    finally:
        session.close()

def query_swap_history(account: str, symbol:str, limit: int = 100):
    session = next(databases.get_db())
    sql = """
        SELECT account, symbol, max(swap_long) as swap_long, max(swap_short) as swap_short, DATE(date) as day 
        FROM tick
        WHERE account = :account and symbol = :symbol
        GROUP BY day
        ORDER BY day DESC limit :limit
        """
    
    try: 
        result = session.execute(text(sql), {'account': account, "symbol": symbol, "limit": limit})
        rows = result.fetchall()

        print(rows)
        swap_history = [
            {
                "swap_long": row[2],
                "swap_short": row[3],
                "date": row[4].strftime("%Y-%m-%d")
            } for row in rows
        ]
        return swap_history
    except Exception as e: 
        print(f"Error query swap history: {e}")
        return []
    finally:
        session.close()
