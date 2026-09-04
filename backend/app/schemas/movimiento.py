from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

TipoMovimiento = Literal["ENTRADA", "SALIDA", "AJUSTE", "DEVOLUCION"]




class MovimientoCreate(BaseModel):
    tipo: TipoMovimiento
    motivo: str = Field(..., min_length=3, max_length=255)
    proveedor_id: int | None = Field(default=None, description="Obligatorio solo en entradas por compra")



class MovimientoResponse(BaseModel):
    id: int
    tipo: str
    motivo: str
    costo_total: Decimal
    fecha: datetime
    usuario_id: int
    proveedor_id: int | None

    model_config = ConfigDict(from_attributes=True)