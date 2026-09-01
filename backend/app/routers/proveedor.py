from fastapi import Depends, HTTPException
from app.database.connection import get_db
from sqlalchemy import select, or_
from app.models.proveedor import Proveedor
from app.schemas.proveedor import ProveedorResponse, ProveedorCreate, ProveedorUpdate
from fastapi import APIRouter


router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/proveedores", response_model=list[ProveedorResponse])
def obtener_Proveedor(db = Depends(get_db)):

    consulta = select(Proveedor)
    resultado = db.execute(consulta)
    proveedor = resultado.scalars().all()

    return proveedor

#GET solicitar/obtener un recurso por id
@router.get("/proveedores/{proveedor_id}", response_model=ProveedorResponse)
def obtener_proveedor(proveedor_id: int, db=Depends(get_db)):
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
@router.post("/proveedores", response_model=ProveedorResponse)
def crear_proveedor(
    proveedor_data: ProveedorCreate,
    db = Depends(get_db)
):
    consulta = select(Proveedor).where(
    or_(
        Proveedor.email == proveedor_data.email,
        Proveedor.rut == proveedor_data.rut
    )
)
    resultado = db.execute(consulta)
    datos_existentes = resultado.scalars().all()


    for dato_existente in datos_existentes:

        if dato_existente.rut == proveedor_data.rut and dato_existente.email == proveedor_data.email:
            dato = f"El rut {proveedor_data.rut} y el email {proveedor_data.email} ya existen"

        elif dato_existente.email == proveedor_data.email:
            dato = f"El email {proveedor_data.email} ya existe"
            

        elif dato_existente.rut == proveedor_data.rut:
            dato = f"El rut {proveedor_data.rut} ya existe"

        raise HTTPException(
            status_code=409,
            detail=dato
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
@router.put("/proveedores/{proveedor_id}", response_model=ProveedorResponse)
def actualizar_proveedor(proveedor_id: int, proveedor_data: ProveedorUpdate, db = Depends(get_db)):
    consulta = select(Proveedor).where(Proveedor.id == proveedor_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()

    if proveedor is None:
            raise HTTPException(
                status_code=404,
                detail="proveedor no encontrado"
            )
    
    datos_actualizados = proveedor_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(proveedor, campo, valor)

    try:
        db.commit()
        db.refresh(proveedor)

        return proveedor

    except Exception:
        db.rollback()
        raise

#DELETE sirve para eliminar un recurso
@router.delete("/proveedores/{proveedores_id}")
def eliminar_proveedor(
        proveedores_id: int,
        db=Depends(get_db)
    ):

    consulta = select(Proveedor).where(Proveedor.id == proveedores_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()

    if proveedor is None:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )
    try:
        db.delete(proveedor)
        db.commit()
        return {"detail": "Proveedor eliminado correctamente"}
    except Exception:
        db.rollback()
        raise