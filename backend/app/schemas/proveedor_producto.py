from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

# Schemas compactos para no arrastrar datos innecesarios
class ProductoSimpleResponse(BaseModel):
    id: int
    nombre: str
    sku: str

    model_config = ConfigDict(from_attributes=True)

class ProveedorSimpleResponse(BaseModel):
    id: int
    nombre: str
    rut: str

    model_config = ConfigDict(from_attributes=True)

# Esquema para responder al cliente
class ProvProducResponse(BaseModel):
    id: int
    costo_compra: Decimal
    producto_id: int
    proveedor_id: int

    producto: ProductoSimpleResponse | None = None
    proveedor: ProveedorSimpleResponse | None = None

    model_config = ConfigDict(from_attributes=True)

# Esquema para crear la relación
class ProvProducCreate(BaseModel):
    costo_compra: Decimal = Field(..., gt=0, decimal_places=2)
    producto_id: int = Field(..., gt=0)
    proveedor_id: int = Field(..., gt=0)

# Esquema para actualizar (habitualmente solo cambia el costo de compra)
class ProvProducUpdate(BaseModel):
    costo_compra: Decimal | None = Field(default=None, gt=0, decimal_places=2)