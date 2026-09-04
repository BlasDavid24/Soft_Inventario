from pydantic import BaseModel, ConfigDict

# Esquema para responder categoría
class CategoriaResponse(BaseModel):
    id: int
    nombre: str

    model_config = ConfigDict(from_attributes=True)

# Esquema para crear categoría
class CategoriaCreate(BaseModel):
    nombre: str

# Esquema para actualizar categoría
class CategoriaUpdate(BaseModel):
    nombre: str | None = None