from decimal import Decimal
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship 
from app.database.base import Base
from sqlalchemy import func
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.categoria import Categoria

#Aqui crearemos la clase que usara SQLAlchemy 
#para informale que esa tabla ya existe en PostgreSQL
class Producto(Base):
    __tablename__ = "producto"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    sku: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    precio: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    uni_medida: Mapped[str] = mapped_column(String(10), nullable=False)
    stock_actual: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    stock_minimo: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    fecha_act: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    categoria_id: Mapped[int] = mapped_column(Integer, ForeignKey("categoria.id"), nullable=False)

    categoria: Mapped["Categoria"] = relationship(back_populates="productos")