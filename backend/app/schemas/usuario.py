from pydantic import BaseModel

#Esquema para validar los datos al consultar un proveedor
class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    apellido: str    
    rut: str
    username: str
    rol: str
    activo: bool  
    email: str

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str    
    rut: str
    password: str
    username: str
    rol: str
    email: str

class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    rut: str | None = None
    username: str | None = None
    rol: str | None = None
    email: str | None = None

class UsuarioActivo(BaseModel):
    activo: bool | None = None