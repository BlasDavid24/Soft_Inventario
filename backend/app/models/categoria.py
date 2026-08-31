from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

#Aqui crearemos la clase que usara SQLAlchemy 
#para informale que esa tabla ya existe en PostgreSQL

class Categoria(Base):
    __tablename__ = "categoria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)