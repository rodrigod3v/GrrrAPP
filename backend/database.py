import sqlite3
from sqlalchemy import create_engine
from sqlalchemy.event import listens_for
from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel

sqlite_file_name = "grrrapp.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# Enable SQLite WAL mode using SQLAlchemy events for connection
@listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if type(dbapi_connection) is sqlite3.Connection:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA temp_store=MEMORY")
        cursor.execute("PRAGMA mmap_size=30000000000")
        cursor.close()

# Avoid thread checks since FastAPI manages async tasks well with standard sync sessions here
connect_args = {"check_same_thread": False}

engine = create_engine(sqlite_url, connect_args=connect_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
