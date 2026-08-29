from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

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