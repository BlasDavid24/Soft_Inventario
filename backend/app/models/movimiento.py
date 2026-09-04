from sqlalchemy import Integer, Numeric, ForeignKey, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from decimal import Decimal
from datetime import datetime
from typing import List, TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.models.usuario import Usuario
    from app.models.proveedor import Proveedor
    from app.models.detalle_movimiento import DetalleMovimiento

class Movimiento(Base):
    __tablename__ = "movimiento"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo: Mapped[str] = mapped_column(String(50), nullable=False)
    costo_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    motivo: Mapped[str] = mapped_column(String(250), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuario.id"), nullable=True)
    proveedor_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("proveedor.id"), nullable=True)

    usuario: Mapped["Usuario"] = relationship()
    proveedor: Mapped[Optional["Proveedor"]] = relationship()
    detalles: Mapped[List["DetalleMovimiento"]] = relationship(
        back_populates="movimiento", 
        cascade="all, delete-orphan"
    )
    