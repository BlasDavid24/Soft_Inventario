from decimal import Decimal
from pydantic import BaseModel
from datetime import datetime

class MovimientoResponse(BaseModel):
    id: int
    tipo: str
    costo_total: Decimal
    motivo: str
    fecha: datetime
    usuario_id: int
    proveedor_id: int

#Esquema para validar los datos al crear un producto
class MovimientoCreate(BaseModel):
    tipo: str
    costo_total: Decimal
    motivo: str
    usuario_id: int
    proveedor_id: int

#Esquema para validar los datos al actualizar un producto
class MovimientoUpdate(BaseModel):
    tipo: str | None = None
    costo_total: Decimal | None = None
    motivo: str | None = None
    usuario_id: int | None = None
    proveedor_id: int | None = None