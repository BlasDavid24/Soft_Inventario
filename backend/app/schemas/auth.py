from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    rol: str
    nombre: str