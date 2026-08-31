from decimal import Decimal
from sqlalchemy import ForeignKey, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

#Aqui crearemos la clase que usara SQLAlchemy 
#para informale que esa tabla ya existe en PostgreSQL


class Proveedor_producto(Base):
    __tablename__ = "proveedor_producto"

    __table_args__ = (
        UniqueConstraint(
            "proveedor_id",
            "producto_id",
            name="uq_proveedor_producto"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    costo_compra:Mapped[Decimal] =  mapped_column(Numeric(12, 2), nullable=False)
    producto_id: Mapped[int] = mapped_column(Integer, ForeignKey("producto.id"), nullable=False)
    proveedor_id: Mapped[int] = mapped_column(Integer, ForeignKey("proveedor.id"), nullable=False)