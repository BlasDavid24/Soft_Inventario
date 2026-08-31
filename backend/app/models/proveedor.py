from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base

class Proveedor(Base):
    __tablename__ = "proveedor"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    rut: Mapped[str] = mapped_column(String(11), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    telefono: Mapped[str] = mapped_column(String(15), nullable=False)
    direccion: Mapped[str] = mapped_column(String(250), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)