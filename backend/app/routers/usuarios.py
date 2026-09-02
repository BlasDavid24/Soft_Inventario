from fastapi import Depends, HTTPException
from app.database.connection import get_db
from sqlalchemy import select, or_
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse, UsuarioCreate, UsuarioUpdate, UsuarioActivo
from fastapi import APIRouter
from app.security.password import hash_password

router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/usuarios", response_model=list[UsuarioResponse])
def obtener_usuario(db = Depends(get_db)):

    consulta = select(Usuario)
    resultado = db.execute(consulta)
    usuario = resultado.scalars().all()

    return usuario

#GET solicitar/obtener un recurso por id
@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db=Depends(get_db)):
    consulta = select(Usuario).where(Usuario.id == usuario_id)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()


    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    return usuario

#POST crea un recurso
@router.post("/usuarios", response_model=UsuarioResponse)
def crear_usuario(
    usuario_data: UsuarioCreate,
    db = Depends(get_db)
):
    consulta = select(Usuario).where(
    or_(
        Usuario.email == usuario_data.email,
        Usuario.rut == usuario_data.rut,
        Usuario.username == usuario_data.username
    )
)
    resultado = db.execute(consulta)
    datos_existentes = resultado.scalars().all()

    errores = []

    for dato_existente in datos_existentes:

        if dato_existente.rut == usuario_data.rut:
            errores.append(f"El rut '{usuario_data.rut}' ya existe")

        if dato_existente.email == usuario_data.email:
            errores.append(f"El email '{usuario_data.email}' ya existe")

        if dato_existente.username == usuario_data.username:
            errores.append(f"El username '{usuario_data.username}' ya existe")

    if errores:
        raise HTTPException(
        status_code=409,
        detail=errores
        )
    
    usuario = Usuario(
        nombre=usuario_data.nombre,
        apellido=usuario_data.apellido,
        rut=usuario_data.rut,
        password_hash=hash_password(usuario_data.password),
        username=usuario_data.username,
        rol=usuario_data.rol,
        email=usuario_data.email
    )

    try:
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        return usuario

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, usuario_data: UsuarioUpdate , db = Depends(get_db)):
    consulta = select(Usuario).where(Usuario.id == usuario_id)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()

    if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )
    
    datos_actualizados = usuario_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(usuario, campo, valor)

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except Exception:
        db.rollback()
        raise

#PATCH sirve para actualizar parcialmente un recurso
@router.patch("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def activar_desactivar_usuario(
        usuario_id: int, usuario_data: UsuarioActivo,
        db=Depends(get_db)
    ):

    consulta = select(Usuario).where(Usuario.id == usuario_id)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="usuario no encontrado"
        )

    usuario.activo = usuario_data.activo

    
    try:
        db.commit()
        db.refresh(usuario)
    
        return usuario
    
    except Exception:
        db.rollback()
        raise