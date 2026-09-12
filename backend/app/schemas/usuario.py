from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Roles válidos del sistema
RolUsuario = Literal["ADMINISTRADOR", "ENCARGADO", "CONSULTOR"]


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    rut: str
    username: str
    email: EmailStr
    rol: str
    activo: bool
    primer_login: bool

    model_config = ConfigDict(from_attributes=True)


class UsuarioCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    apellido: str = Field(..., min_length=2, max_length=100)
    rut: str = Field(..., min_length=8, max_length=20)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    rol: RolUsuario


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    rut: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    rol: RolUsuario | None = None


class UsuarioActivo(BaseModel):
    activo: bool

class UsuarioPasswordTemporal(UsuarioResponse):
    password_temporal: str

class CambiarPasswordInicialRequest(BaseModel):
    password_actual: str = Field(..., description="La contraseña temporal recibida")
    nueva_password: str = Field(..., min_length=8, max_length=100, description="La nueva contraseña definitiva")