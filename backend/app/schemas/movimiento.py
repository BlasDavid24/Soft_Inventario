from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.detalle_movimiento import DetalleMovimientoCreate, DetalleMovimientoResponse

# Schema simple para devolver solo lo necesario del proveedor
class ProveedorResumen(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True

# Schema simple para el usuario (si también quieres su nombre)
class UsuarioResumen(BaseModel):
    id: int
    nombre: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

class MovimientoResponse(BaseModel):
    id: int
    tipo: str
    costo_total: Decimal
    motivo: str | None
    fecha: datetime
    usuario_id: Optional[int] = None
    proveedor_id: Optional[int] = None
    
    # Objetos anidados cargados por las relaciones de SQLAlchemy
    usuario: Optional[UsuarioResumen] = None
    proveedor: Optional[ProveedorResumen] = None
    detalles: list[DetalleMovimientoResponse] = []

    model_config = ConfigDict(from_attributes=True)

#Schemas creacion de Movimiento
TipoMovimiento = Literal["ENTRADA", "SALIDA", "AJUSTE", "DEVOLUCION CLIENTE", "DEVOLUCION PROVEEDOR"]
class MovimientoCreate(BaseModel):
    tipo: TipoMovimiento
    motivo: str | None = Field(default=None, max_length=250)
    proveedor_id: int | None = Field(default=None, gt=0, description="Opcional si es SALIDA o AJUSTE")
    detalles: list[DetalleMovimientoCreate] = Field(..., min_length=1)


