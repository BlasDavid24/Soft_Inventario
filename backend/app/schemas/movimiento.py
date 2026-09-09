from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.detalle_movimiento import DetalleMovimientoCreate, DetalleMovimientoResponse

class MovimientoResponse(BaseModel):
    id: int
    tipo: str
    costo_total: Decimal
    motivo: str | None
    fecha: datetime
    usuario_id: int
    proveedor_id: int | None
    detalles: list[DetalleMovimientoResponse] = []

    model_config = ConfigDict(from_attributes=True)

#Schemas creacion de Movimiento
TipoMovimiento = Literal["ENTRADA", "SALIDA", "AJUSTE", "DEVOLUCION CLIENTE", "DEVOLUCION PROVEEDOR"]
class MovimientoCreate(BaseModel):
    tipo: TipoMovimiento
    motivo: str | None = Field(default=None, max_length=250)
    proveedor_id: int | None = Field(default=None, gt=0, description="Opcional si es SALIDA o AJUSTE")
    detalles: list[DetalleMovimientoCreate] = Field(..., min_length=1)


