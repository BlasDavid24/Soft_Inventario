from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

#Plantilla para traer la información
class ProductoResponse(BaseModel):
    id: int
    nombre: str
    sku: str
    precio: Decimal
    uni_medida: str
    stock_actual: Decimal
    stock_minimo: Decimal
    activo: bool
    fecha_creacion: datetime
    fecha_act: datetime
    categoria_id: int

#Plantilla para enviar la información
class ProductoCreate(BaseModel):
    nombre: str
    sku: str
    precio: Decimal
    uni_medida: str
    stock_actual: Decimal
    stock_minimo: Decimal
    categoria_id: int

class ProductoUpdate(BaseModel):
    nombre: str | None = None
    sku: str | None = None
    precio: Decimal | None = None
    uni_medida: str | None = None
    stock_actual: Decimal | None = None
    stock_minimo: Decimal | None = None
    categoria_id: int | None = None