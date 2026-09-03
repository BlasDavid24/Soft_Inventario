from sqlalchemy.orm import Session
from app.models.movimiento import Movimiento
from app.schemas.movimiento import MovimientoCreate

def crear_movimiento(
    movimiento_data: MovimientoCreate,
    db: Session
):
    pass