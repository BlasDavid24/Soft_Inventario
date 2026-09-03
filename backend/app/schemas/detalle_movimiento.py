from decimal import Decimal
from pydantic import BaseModel

class DetalleMovimientoResponse(BaseModel):
    id: int
    cantidad: Decimal
    stock_anterior: Decimal
    stock_nuevo: Decimal
    costo_unitario: Decimal
    subtotal: Decimal
    producto_id: int
    movimiento_id: int

#Esquema para validar los datos al crear un producto
class DetalleMovimientoCreate(BaseModel):
    cantidad: Decimal
    stock_anterior: Decimal
    stock_nuevo: Decimal
    costo_unitario: Decimal
    producto_id: int
    movimiento_id: int

#Esquema para validar los datos al actualizar un producto
class DetalleMovimientoUpdate(BaseModel):
    cantidad: Decimal | None = None
    stock_anterior: Decimal | None = None
    stock_nuevo: Decimal | None = None
    costo_unitario: Decimal | None = None
    producto_id: int | None = None
    movimiento_id: int | None = None