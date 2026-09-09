from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models.usuario import Usuario
from app.schemas.auth import TokenResponse
from app.security.password import verify_password
from app.security.jwt import crear_token_acceso

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    consulta = select(Usuario).where(Usuario.username == form_data.username)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()

    #Validar que exista y que la contraseña coincida con el hash
    if usuario is None or not verify_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    #Validar que el usuario esté activo en el sistema
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo"
        )

    #Generar el token con los datos clave dentro del payload
    token = crear_token_acceso(
        datos={
            "sub": usuario.username,
            "id": usuario.id,
            "rol": usuario.rol
        }
    )

    #Responder con el token y datos informativos
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": usuario.username,
        "rol": usuario.rol,
        "nombre": f"{usuario.nombre} {usuario.apellido}"
    }