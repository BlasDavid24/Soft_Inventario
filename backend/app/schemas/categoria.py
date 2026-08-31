from pydantic import BaseModel

#Esquema para validar los datos al consultar un producto
class CategoriaResponse(BaseModel):
    id: int
    nombre: str

#Esquema para validar los datos al crear un producto
class CategoriaCreate(BaseModel):
    nombre: str

#Esquema para validar los datos al actualizar un producto
class CategoriaUpdate(BaseModel):
    nombre: str | None = None