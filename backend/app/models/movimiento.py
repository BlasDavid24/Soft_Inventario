from sqlalchemy import Integer, Numeric, ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
from sqlalchemy import func
from decimal import Decimal
from datetime import datetime


class Movimiento(Base):
    __tablename__ = "movimiento"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tipo: Mapped[str] = mapped_column(String(50), nullable=True)
    costo_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=True)
    motivo: Mapped[str] = mapped_column(String(250), nullable=True)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuario.id"))
    proveedor_id: Mapped[int] = mapped_column(Integer, ForeignKey("proveedor.id"))
    