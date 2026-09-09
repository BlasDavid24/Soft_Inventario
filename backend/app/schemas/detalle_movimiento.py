from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


# Schema compacto para mostrar informacion de producto
class ProductoMovimientoResponse(BaseModel):
    id: int
    nombre: str
    sku: str

    model_config = ConfigDict(from_attributes=True)


# Esquema para responder el Detalle
class DetalleMovimientoResponse(BaseModel):
    id: int
    cantidad: int
    costo_unitario: Decimal
    subtotal: Decimal
    stock_anterior: Decimal
    stock_nuevo: Decimal
    producto: ProductoMovimientoResponse

    model_config = ConfigDict(from_attributes=True)


# Esquema que envía el cliente al registrar 
class DetalleMovimientoCreate(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., gt=0, description="Cantidad de unidades a mover")
    costo_unitario: Decimal = Field(..., gt=0, decimal_places=2)