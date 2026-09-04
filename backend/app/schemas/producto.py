from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.categoria import CategoriaResponse


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
    categoria: CategoriaResponse | None = None

    model_config = ConfigDict(from_attributes=True)


class ProductoCreate(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    sku: str = Field(..., min_length=1, max_length=50)
    precio: Decimal = Field(..., ge=0)
    uni_medida: str = Field(..., min_length=1, max_length=10)
    stock_actual: Decimal = Field(default=Decimal("0.000"), ge=0)
    stock_minimo: Decimal = Field(default=Decimal("0.000"), ge=0)
    categoria_id: int


class ProductoUpdate(BaseModel):
    nombre: str | None = None
    sku: str | None = None
    precio: Decimal | None = Field(default=None, ge=0)
    uni_medida: str | None = None
    stock_minimo: Decimal | None = Field(default=None, ge=0)
    categoria_id: int | None = None
    activo: bool | None = None


class ProductoActivo(BaseModel):
    activo: bool