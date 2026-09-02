from sqlalchemy import Boolean, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base
from sqlalchemy import func


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    rut: Mapped[str] = mapped_column(String(10), nullable=False, unique=True)
    username: Mapped[str] = mapped_column(String(80), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(20), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=func.now())
    email: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)