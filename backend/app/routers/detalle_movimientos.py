from fastapi import Depends, HTTPException
from app.database.connection import get_db
from sqlalchemy import select
from app.models.detalle_movimiento import Detalle_movimiento
from app.models.movimiento import Movimiento
from app.models.producto import Producto
from app.schemas.detalle_movimiento import DetalleMovimientoCreate, DetalleMovimientoResponse, DetalleMovimientoUpdate
from fastapi import APIRouter


router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/detalle_movimiento", response_model=list[DetalleMovimientoResponse])
def obtener_detalle_movimiento_data(db = Depends(get_db)):

    consulta = select(Detalle_movimiento)
    resultado = db.execute(consulta)
    detalle_movimiento = resultado.scalars().all()

    return detalle_movimiento

#GET solicitar/obtener un recurso por id
@router.get("/detalle_movimiento/{detalle_movimiento_id}", response_model=DetalleMovimientoResponse)
def obtener_movimiento(detalle_movimiento_id: int, db=Depends(get_db)):
    consulta = select(Detalle_movimiento).where(Detalle_movimiento.id == detalle_movimiento_id)
    resultado = db.execute(consulta)
    detalle_movimiento = resultado.scalar_one_or_none()


    if detalle_movimiento is None:
        raise HTTPException(
            status_code=404,
            detail="Informacion no encontrada"
        )
    
    return detalle_movimiento

#POST crea un recurso
@router.post("/detalle_movimiento", response_model=DetalleMovimientoResponse)
def crear_movimiento(
    detalle_movimiento_data: DetalleMovimientoCreate,
    db = Depends(get_db)
):
    
    producto = db.get(Producto, detalle_movimiento_data.producto_id)
    if producto is None:
                    raise HTTPException(
                        status_code=404,
                        detail=f"El producto no existe"
                )

    detalle_movimiento = Detalle_movimiento(
        cantidad=detalle_movimiento_data.cantidad,
        stock_anterior=detalle_movimiento_data.stock_anterior,
        stock_nuevo=detalle_movimiento_data.stock_nuevo,
        costo_unitario=detalle_movimiento_data.costo_unitario,
        subtotal=(
        detalle_movimiento_data.cantidad
        * detalle_movimiento_data.costo_unitario
        ),
        producto_id=detalle_movimiento_data.producto_id,
        movimiento_id=detalle_movimiento_data.movimiento_id,
    )

    try:
        db.add(detalle_movimiento)
        db.commit()
        db.refresh(detalle_movimiento)
        
        return detalle_movimiento

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/detalle_movimiento/{detalle_movimiento_id}", response_model=DetalleMovimientoResponse)
def actualizar_movimiento_producto(detalle_movimiento_id: int, 
    detalle_movimiento_data: DetalleMovimientoUpdate, db = Depends(get_db)):
    consulta = select(Detalle_movimiento).where(Detalle_movimiento.id == detalle_movimiento_id)
    resultado = db.execute(consulta)
    detalle_movimiento = resultado.scalar_one_or_none()

    if detalle_movimiento is None:
            raise HTTPException(
                status_code=404,
                detail="Informacion no encontrado"
            )
    
    datos_actualizados = detalle_movimiento_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(detalle_movimiento, campo, valor)


    detalle_movimiento.subtotal = (
        detalle_movimiento.cantidad *
        detalle_movimiento.costo_unitario
    )
    
    try:
        db.commit()
        db.refresh(detalle_movimiento)

        return detalle_movimiento

    except Exception:
        db.rollback()
        raise