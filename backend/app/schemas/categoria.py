from pydantic import BaseModel

class CategoriaResponse(BaseModel):
    id: int
    nombre: str