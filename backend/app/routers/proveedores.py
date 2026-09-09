from fastapi import Depends, HTTPException
from app.dependencies.auth import get_db, requerir_rol, obtener_usuario_actual
from app.models.usuario import Usuario
from sqlalchemy import select, or_
from app.models.proveedor import Proveedor
from app.schemas.proveedor import ProveedorResponse, ProveedorCreate, ProveedorUpdate, ProveedorActivo
from fastapi import APIRouter, Query


router = APIRouter(prefix="/proveedor", tags=["Proveedor"])

# GET solicitar/obtener un recurso (con búsqueda por nombre o RUT y filtro por activo)
@router.get("/filtrar", response_model=list[ProveedorResponse])
def obtener_proveedores(
    buscar: str | None = Query(default=None, description="Buscar por nombre o RUT"),
    activo: bool | None = Query(default=None, description="Filtrar por estado activo/inactivo"),
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    consulta = select(Proveedor)

    if buscar:
        termino = f"%{buscar.strip()}%"
        consulta = consulta.where(
            or_(
                Proveedor.nombre.ilike(termino),
                Proveedor.rut.ilike(termino)
            )
        )

    if activo is not None:
        consulta = consulta.where(Proveedor.activo == activo)

    resultado = db.execute(consulta)
    proveedores = resultado.scalars().all()

    return proveedores

#GET solicitar/obtener un recurso por id
@router.get("/filtrar ID/{proveedor_id}", response_model=ProveedorResponse)
def obtener_proveedor(
    proveedor_id: int, 
    db=Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    ):
    consulta = select(Proveedor).where(Proveedor.id == proveedor_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()


    if proveedor is None:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )
    
    return proveedor

#POST crea un recurso
@router.post("/crear", response_model=ProveedorResponse)
def crear_proveedor(
    proveedor_data: ProveedorCreate,
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):
    consulta = select(Proveedor).where(
    or_(
        Proveedor.email == proveedor_data.email,
        Proveedor.rut == proveedor_data.rut
    )
)
    resultado = db.execute(consulta)
    datos_existentes = resultado.scalars().all()

    errores = []

    for dato_existente in datos_existentes:
        if dato_existente.rut == proveedor_data.rut:
            errores.append(f"El rut {proveedor_data.rut} ya existe")
        if dato_existente.email == proveedor_data.email:
            errores.append(f"El email {proveedor_data.email} ya existe")

    if errores:
        raise HTTPException(
        status_code=409,
        detail=errores
    )


    proveedor = Proveedor(
        nombre=proveedor_data.nombre,
        rut=proveedor_data.rut,
        email=proveedor_data.email,
        telefono=proveedor_data.telefono,
        direccion=proveedor_data.direccion
    )

    try:
        db.add(proveedor)
        db.commit()
        db.refresh(proveedor)
        
        return proveedor

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/editar/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(
    proveedor_id: int, 
    proveedor_data: ProveedorUpdate, 
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
    ):
    consulta = select(Proveedor).where(Proveedor.id == proveedor_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()
    datos_actualizados = proveedor_data.model_dump(exclude_unset=True)

    #Valida si existen el proveedor
    if proveedor is None:
            raise HTTPException(
                status_code=404,
                detail="proveedor no encontrado"
            )

    #Validamos duplicados de RUT o Email solo si vienen en los datos enviados
    nuevo_rut = datos_actualizados.get("rut")
    nuevo_email = datos_actualizados.get("email")

    condiciones_duplicado = []
    if nuevo_rut and nuevo_rut != proveedor.rut:
        condiciones_duplicado.append(Proveedor.rut == nuevo_rut)
    if nuevo_email and nuevo_email != proveedor.email:
        condiciones_duplicado.append(Proveedor.email == nuevo_email)

    if condiciones_duplicado:
        consulta_duplicados = select(Proveedor).where(
            or_(*condiciones_duplicado),
            Proveedor.id != proveedor_id
        )
        duplicados = db.execute(consulta_duplicados).scalars().all()
        
        errores = []
        for item in duplicados:
            if nuevo_rut and item.rut == nuevo_rut:
                errores.append(f"El RUT {nuevo_rut} ya existe")
            if nuevo_email and item.email == nuevo_email:
                errores.append(f"El email {nuevo_email} ya existe")

        if errores:
            raise HTTPException(
                status_code=409,
                detail=errores
            )
       
    
    for campo, valor in datos_actualizados.items():
        setattr(proveedor, campo, valor)

    try:
        db.commit()
        db.refresh(proveedor)

        return proveedor

    except Exception:
        db.rollback()
        raise

#PATCH sirve para actualizar parcialmente un recurso
@router.patch("/desactivar/{proveedor_id}", response_model=ProveedorResponse)
def activar_desactivar_proveedor(
        proveedor_id: int, proveedor_data: ProveedorActivo,
        db=Depends(get_db),
        usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
    ):

    consulta = select(Proveedor).where(Proveedor.id == proveedor_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()

    if proveedor is None:
        raise HTTPException(
            status_code=404,
            detail="proveedor no encontrado"
        )

    proveedor.activo = proveedor_data.activo

    
    try:
        db.commit()
        db.refresh(proveedor)
    
        return proveedor
    
    except Exception:
        db.rollback()
        raise