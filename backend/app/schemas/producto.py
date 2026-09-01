from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

#Esquema para validar los datos al consultar un producto
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

#Esquema para validar los datos al crear un producto
class ProductoCreate(BaseModel):
    nombre: str
    sku: str
    precio: Decimal
    uni_medida: str
    stock_actual: Decimal
    stock_minimo: Decimal
    categoria_id: int

#Esquema para validar los datos al actualizar un producto
class ProductoUpdate(BaseModel):
    nombre: str | None = None
    sku: str | None = None
    precio: Decimal | None = None
    uni_medida: str | None = None
    stock_actual: Decimal | None = None
    stock_minimo: Decimal | None = None
    categoria_id: int | None = None
    activo: bool | None = None