from pydantic import BaseModel

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    rol: str
    nombre: str
    primer_login: bool