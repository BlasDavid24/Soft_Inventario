from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship 
from app.database.base import Base
from typing import List, TYPE_CHECKING

#Aqui crearemos la clase que usara SQLAlchemy 
#para informale que esa tabla ya existe en PostgreSQL

if TYPE_CHECKING:
    from app.models.producto import Producto

class Categoria(Base):
    __tablename__ = "categoria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    productos: Mapped[List["Producto"]] = relationship(back_populates="categoria")