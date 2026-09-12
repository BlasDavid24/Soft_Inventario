from fastapi import Depends, HTTPException, status
from sqlalchemy import select, or_
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioResponse, UsuarioCreate, UsuarioUpdate, UsuarioActivo, UsuarioPasswordTemporal
from fastapi import APIRouter, Query
from app.security.password import hash_password, generar_password_temporal, verify_password
from app.dependencies.auth import get_db, requerir_rol, obtener_usuario_actual
from app.schemas.usuario import CambiarPasswordInicialRequest


router = APIRouter(prefix="/usuarios", tags=["Usuario"])

# GET solicitar/obtener usuarios (con búsqueda por texto y filtros por rol y estado)
@router.get("/filtrar", response_model=list[UsuarioResponse])
def obtener_usuarios(
    buscar: str | None = Query(default=None, description="Buscar por nombre, apellido, username o RUT"),
    rol: str | None = Query(default=None, description="Filtrar por rol"),
    activo: bool | None = Query(default=None, description="Filtrar por estado activo/inactivo"),
    db = Depends(get_db),
    usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
):
    consulta = select(Usuario)

    if buscar:
        termino = f"%{buscar.strip()}%"
        consulta = consulta.where(
            or_(
                Usuario.nombre.ilike(termino),
                Usuario.apellido.ilike(termino),
                Usuario.username.ilike(termino),
                Usuario.rut.ilike(termino)
            )
        )

    if rol:
        consulta = consulta.where(Usuario.rol == rol)

    if activo is not None:
        consulta = consulta.where(Usuario.activo == activo)

    resultado = db.execute(consulta)
    usuarios = resultado.scalars().all()

    return usuarios

#GET solicitar/obtener un recurso por id
@router.get("/filtrar ID/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db=Depends(get_db),
    usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))):
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
@router.post("/crear", response_model=UsuarioPasswordTemporal)
def crear_usuario(
    usuario_data: UsuarioCreate,
    db = Depends(get_db),
    usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
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

    password_temporal = generar_password_temporal() 
    password_hasheada = hash_password(password_temporal)
    
    usuario = Usuario(
        nombre=usuario_data.nombre,
        apellido=usuario_data.apellido,
        rut=usuario_data.rut,
        password_hash=password_hasheada,
        username=usuario_data.username,
        rol=usuario_data.rol,
        email=usuario_data.email
    )

    try:
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
        
        return {
            "id": usuario.id,
            "nombre": usuario.nombre,
            "apellido": usuario.apellido,
            'rut': usuario.rut,
            "username": usuario.username,
            "email": usuario.email,
            "rol": usuario.rol,
            "activo": usuario.activo,
            "password_temporal": password_temporal
             
        }

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/editar/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, usuario_data: UsuarioUpdate , db = Depends(get_db),
    usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))):
    consulta = select(Usuario).where(Usuario.id == usuario_id)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()

    #Valida que el usuario exista
    if usuario is None:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

    #Valida que email, username  y rut no sean repetidos
    if usuario_data.rut is not None or usuario_data.email is not None or usuario_data.username is not None:
        consulta = select(Usuario).where(
            or_(
                Usuario.email == usuario_data.email,
                Usuario.rut == usuario_data.rut,
                Usuario.username == usuario_data.username
            ),
            Usuario.id != usuario_id
        )
        resultado = db.execute(consulta)
        datos_existentes = resultado.scalars().all()
        datos_actualizados = usuario_data.model_dump(exclude_unset=True)
    
# Validar duplicados de RUT, Email o Username solo si cambiaron
    nuevo_rut = datos_actualizados.get("rut")
    nuevo_email = datos_actualizados.get("email")
    nuevo_username = datos_actualizados.get("username")

    condiciones_duplicado = []
    if nuevo_rut and nuevo_rut != usuario.rut:
        condiciones_duplicado.append(Usuario.rut == nuevo_rut)
    if nuevo_email and nuevo_email != usuario.email:
        condiciones_duplicado.append(Usuario.email == nuevo_email)
    if nuevo_username and nuevo_username != usuario.username:
        condiciones_duplicado.append(Usuario.username == nuevo_username)

    if condiciones_duplicado:
        consulta_duplicados = select(Usuario).where(
            or_(*condiciones_duplicado),
            Usuario.id != usuario_id
        )
        duplicados = db.execute(consulta_duplicados).scalars().all()

        errores = []
        for dato in duplicados:
            if nuevo_rut and dato.rut == nuevo_rut:
                errores.append(f"El RUT '{nuevo_rut}' ya existe")
            if nuevo_email and dato.email == nuevo_email:
                errores.append(f"El email '{nuevo_email}' ya existe")
            if nuevo_username and dato.username == nuevo_username:
                errores.append(f"El username '{nuevo_username}' ya existe")

        if errores:
            raise HTTPException(
                status_code=409, 
                detail=errores
            )
    
    for campo, valor in datos_actualizados.items():
        setattr(usuario, campo, valor)

    try:
        db.commit()
        db.refresh(usuario)

        return usuario

    except Exception:
        db.rollback()
        raise

@router.post("/cambiar-password-inicial")
def cambiar_password_inicial(
    datos: CambiarPasswordInicialRequest,
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    # Comprobar que la clave temporal ingresada coincida con la que tiene en la BD
    if not verify_password(datos.password_actual, usuario_actual.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña temporal ingresada es incorrecta"
        )

    #Evitar que deje exactamente la misma clave temporal
    if verify_password(datos.nueva_password, usuario_actual.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña no puede ser idéntica a la clave temporal"
        )

    # 3. Actualizar la contraseña y desactivar primer_login
    usuario_actual.password_hash = hash_password(datos.nueva_password)
    usuario_actual.primer_login = False

    try:
        db.commit()
        return {"mensaje": "Contraseña actualizada exitosamente"}
    except Exception:
        db.rollback()
        raise

#PATCH sirve para actualizar parcialmente un recurso
@router.patch("/desactivar/{usuario_id}", response_model=UsuarioResponse)
def activar_desactivar_usuario(
        usuario_id: int, usuario_data: UsuarioActivo,
        db=Depends(get_db),
        usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
    ):

    consulta = select(Usuario).where(Usuario.id == usuario_id)
    resultado = db.execute(consulta)
    usuario = resultado.scalar_one_or_none()

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    if usuario_id == usuario_admin.id and not usuario_data.activo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propia cuenta de usuario en sesión."
        )

    usuario.activo = usuario_data.activo
    
    try:
        db.commit()
        db.refresh(usuario)
    
        return usuario
    
    except Exception:
        db.rollback()
        raise