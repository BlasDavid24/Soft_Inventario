from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

class ProvProducResponse(BaseModel):
    id: int
    costo_compra: Decimal
    producto_id: int
    proveedor_id: int


#Esquema para validar los datos al crear un producto
class ProvProducCreate(BaseModel):
    costo_compra: Decimal
    producto_id: int
    proveedor_id: int

#Esquema para validar los datos al actualizar un producto
class ProvProducUpdate(BaseModel):
    costo_compra: Decimal | None = None
    producto_id: int | None = None
    proveedor_id: int | None = None