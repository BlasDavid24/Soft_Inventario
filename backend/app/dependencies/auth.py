from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models.usuario import Usuario
from app.security.jwt import decodificar_token

#tokenUrl le dice a Swagger UI a qué ruta debe enviar las credenciales para el candado
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db)
) -> Usuario:
    excepcion_credenciales = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales de autenticación no válidas o expiradas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    #Intentamos leer y verificar la firma del token
    payload = decodificar_token(token)
    if payload is None:
        raise excepcion_credenciales

    #Extraemos el username que guardamos en el subject ('sub')
    username: str | None = payload.get("sub")
    if username is None:
        raise excepcion_credenciales

    #Buscamos al usuario en la base de datos para asegurarnos de que aún existe
    consulta = select(Usuario).where(Usuario.username == username)
    usuario = db.execute(consulta).scalar_one_or_none()

    if usuario is None:
        raise excepcion_credenciales

    #Validamos que el usuario no haya sido desactivado después de recibir el token
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta de usuario ha sido desactivada"
        )

    return usuario

def requerir_rol(roles_permitidos: list[str]):

    def verificador_rol(
        usuario_actual: Usuario = Depends(obtener_usuario_actual)
    ) -> Usuario:
        if usuario_actual.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(roles_permitidos)}"
            )
        return usuario_actual

    return verificador_rol