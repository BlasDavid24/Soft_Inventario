from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


# Schema compacto para la línea de detalle
class ProductoMovimientoResponse(BaseModel):
    id: int
    nombre: str
    sku: str

    model_config = ConfigDict(from_attributes=True)


# Esquema para responder el Detalle (Auditoría limpia y legible)
class DetalleMovimientoResponse(BaseModel):
    id: int
    cantidad: int
    costo_unitario: Decimal
    subtotal: Decimal
    stock_anterior: Decimal
    stock_nuevo: Decimal
    producto: ProductoMovimientoResponse
    movimiento_id: int

    model_config = ConfigDict(from_attributes=True)


# Esquema que envía el cliente al registrar 
class DetalleMovimientoCreate(BaseModel):
    producto_id: int = Field(..., gt=0)
    cantidad: int = Field(..., gt=0, description="Cantidad de unidades a mover")
    costo_unitario: Decimal = Field(..., gt=0, decimal_places=2)