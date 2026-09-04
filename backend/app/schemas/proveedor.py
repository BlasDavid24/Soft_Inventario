from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProveedorResponse(BaseModel):
    id: int
    nombre: str
    rut: str
    email: EmailStr
    telefono: str | None = None
    direccion: str | None = None
    activo: bool

    model_config = ConfigDict(from_attributes=True)


class ProveedorCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150)
    rut: str = Field(..., min_length=8, max_length=11)
    email: EmailStr
    telefono: str | None = Field(default=None, max_length=15)
    direccion: str | None = Field(default=None, max_length=255)


class ProveedorUpdate(BaseModel):
    nombre: str | None = None
    rut: str | None = None
    email: EmailStr | None = None
    telefono: str | None = None
    direccion: str | None = None


class ProveedorActivo(BaseModel):
    activo: bool