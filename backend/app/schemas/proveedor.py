from pydantic import BaseModel

#Esquema para validar los datos al consultar un proveedor
class ProveedorResponse(BaseModel):
    id: int
    nombre: str
    rut: str
    email: str
    telefono: str
    direccion: str
    activo: bool    
    
#Esquema para validar los datos al crear un proveedor
class ProveedorCreate(BaseModel):
    nombre: str
    rut: str
    email: str
    telefono: str
    direccion: str

#Esquema para validar los datos al actualizar un proveedor
class ProveedorUpdate(BaseModel):
    nombre: str | None = None
    rut: str | None = None
    email: str | None = None
    telefono: str | None = None
    direccion: str | None = None
    activo: bool | None = None

class ProveedorActivo(BaseModel):
    activo: bool | None = None