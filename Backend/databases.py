from sqlalchemy import create_engine
import sys
from sqlalchemy.orm import (sessionmaker, relationship, scoped_session)

sys.dont_write_bytecode = True
# url = "mysql+pymysql://root:root"