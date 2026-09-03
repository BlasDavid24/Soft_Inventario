from typing import Generator
from app.database.connection import SessionLocal

# Creamos una dependencia que proporciona una sesión
# y garantiza que se cierre al finalizar su uso.
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()