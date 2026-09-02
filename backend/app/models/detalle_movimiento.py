from sqlalchemy import Integer, Numeric, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
from decimal import Decimal


class Detalle_movimiento(Base):
    __tablename__ = "detalle_movimiento"

    __table_args__ = (
            UniqueConstraint(
                "movimiento_id",
                "producto_id",
                name="uq_movimiento_producto"
            ),
        )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cantidad: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=True)
    stock_anterior: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    stock_nuevo: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    costo_unitario: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=True)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("producto.id"))
    movimiento_id: Mapped[int] = mapped_column(Integer, ForeignKey("movimiento.id"))
    