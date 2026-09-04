from sqlalchemy import Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
from decimal import Decimal
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.producto import Producto
    from app.models.movimiento import Movimiento

class DetalleMovimiento(Base):
    __tablename__ = "detalle_movimiento"

    __table_args__ = (
            UniqueConstraint(
                "movimiento_id",
                "producto_id",
                name="uq_movimiento_producto"
            ),
        )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    stock_anterior: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    stock_nuevo: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    costo_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("producto.id"), nullable=False)
    movimiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("movimiento.id"), nullable=False)

    producto: Mapped["Producto"] = relationship()
    movimiento: Mapped["Movimiento"] = relationship(back_populates="detalles")
    