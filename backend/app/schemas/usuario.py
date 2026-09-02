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
    activo: bool  
    email: str