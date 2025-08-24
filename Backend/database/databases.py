from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import sys

sys.dont_write_bytecode = True
url = "mysql+pymysql://root:huyen20897@127.0.0.1:3306/test"
url_postgres = "postgresql+psycopg2://postgres:root@localhost:5432/fxdata"
engine = create_engine(url_postgres, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
# Base.metadata.create_all(bind=engine)
#create session 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()