from fastapi import Depends, HTTPException
from app.database.connection import get_db
from sqlalchemy import select
from app.models.movimiento import Movimiento
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.schemas.movimiento import MovimientoCreate, MovimientoResponse, MovimientoUpdate
from fastapi import APIRouter

router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/movimientos", response_model=list[MovimientoResponse])
def obtener_movimiento(db = Depends(get_db)):

    consulta = select(Movimiento)
    resultado = db.execute(consulta)
    movimiento = resultado.scalars().all()

    return movimiento

#GET solicitar/obtener un recurso por id
@router.get("/movimientos/{movimiento_id}", response_model=MovimientoResponse)
def obtener_movimiento(movimiento_id: int, db=Depends(get_db)):
    consulta = select(Movimiento).where(Movimiento.id == movimiento_id)
    resultado = db.execute(consulta)
    movimiento = resultado.scalar_one_or_none()


    if movimiento is None:
        raise HTTPException(
            status_code=404,
            detail="Movimiento no encontrado"
        )
    
    return movimiento

#POST crea un recurso
@router.post("/movimientos", response_model=MovimientoResponse)
def crear_movimiento(
    movimiento_data: MovimientoCreate,
    db = Depends(get_db)
):
    usuario = db.get(Usuario, movimiento_data.usuario_id)
    if usuario is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"El usuario no existe"
            )
    proveedor = db.get(Proveedor, movimiento_data.movimiento_id)
    if proveedor is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"El proveedor no existe"
                )

    movimiento = Movimiento(
        tipo=movimiento_data.tipo,
        costo_total=movimiento_data.costo_total,
        motivo=movimiento_data.motivo,
        usuario_id=movimiento_data.usuario_id,
        proveedor_id=movimiento_data.proveedor_id,
    )

    try:
        db.add(movimiento)
        db.commit()
        db.refresh(movimiento)
        
        return movimiento

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/movimientos/{movimiento_id}", response_model=MovimientoResponse)
def actualizar_movimiento_producto(movimiento_id: int, 
    movimiento_data: MovimientoUpdate, db = Depends(get_db)):
    consulta = select(Movimiento).where(Movimiento.id == movimiento_id)
    resultado = db.execute(consulta)
    movimiento = resultado.scalar_one_or_none()

    if movimiento is None:
            raise HTTPException(
                status_code=404,
                detail="Informacion no encontrado"
            )
    
    datos_actualizados = movimiento_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(movimiento, campo, valor)

    try:
        db.commit()
        db.refresh(movimiento)

        return movimiento

    except Exception:
        db.rollback()
        raise