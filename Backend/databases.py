from sqlalchemy import create_engine
import sys
from sqlalchemy.orm import (sessionmaker, relationship, scoped_session)
from models import Base

sys.dont_write_bytecode = True
url = "mysql+pymysql://root:huyen20897@127.0.0.1:3306/test"
engine = create_engine(url, echo=False, pool_recycle = 10)

#create table if not exis
Base.metadata.create_all(bind=engine)
#create session 
def create_new_session():
    return scoped_session(sessionmaker(autocommit=False, autoflush=True,expire_on_commit=False, bind=engine))

