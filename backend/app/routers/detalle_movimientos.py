from fastapi import Depends, HTTPException
from app.dependencies import get_db
from sqlalchemy import select
from app.models.detalle_movimiento import DetalleMovimiento
from app.models.producto import Producto
from app.models.movimiento import Movimiento
from app.schemas.detalle_movimiento import DetalleMovimientoCreate, DetalleMovimientoResponse
from fastapi import APIRouter
from sqlalchemy import func


router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/detalle_movimiento", response_model=list[DetalleMovimientoResponse])
def obtener_detalle_movimiento_data(db = Depends(get_db)):

    consulta = select(DetalleMovimiento)
    resultado = db.execute(consulta)
    detalle_movimiento = resultado.scalars().all()

    return detalle_movimiento

#GET solicitar/obtener un recurso por id
@router.get("/detalle_movimiento/{detalle_movimiento_id}", response_model=DetalleMovimientoResponse)
def obtener_movimiento(detalle_movimiento_id: int, db=Depends(get_db)):
    consulta = select(DetalleMovimiento).where(DetalleMovimiento.id == detalle_movimiento_id)
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
    #Verificamos que movimiento exista
    movimiento = db.get(Movimiento, detalle_movimiento_data.movimiento_id)

    if movimiento is None:
        raise HTTPException(
        status_code=404,
        detail="El movimiento no existe"
    )

    #Verificamos que movimiento exista
    producto = db.get(Producto, detalle_movimiento_data.producto_id)
    if producto is None:
        raise HTTPException(
        status_code=404,
        detail=f"El producto no existe"
        )
    

    detalle_movimiento = DetalleMovimiento(
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
        db.flush()

        #Actualizamos con cada detalle el precio del costo total del movimiento
        consulta = select(func.sum(DetalleMovimiento.subtotal)).where(
            DetalleMovimiento.movimiento_id == detalle_movimiento.movimiento_id
            )
        resultado = db.execute(consulta)
        costo_total = resultado.scalar_one()
        movimiento = db.get(Movimiento, detalle_movimiento.movimiento_id)
        movimiento.costo_total = costo_total

        db.commit()
        db.refresh(detalle_movimiento)
        
        return detalle_movimiento

    except Exception:
        db.rollback()
        raise

#DELETE sirve para eliminar un recurso
@router.delete("/detalle_movimiento/{detalle_movimiento_id}")
def eliminar_proveedor_producto(
        detalle_movimiento_id: int,
        db=Depends(get_db)
    ):

    consulta = select(DetalleMovimiento).where(DetalleMovimiento.id == detalle_movimiento_id)
    resultado = db.execute(consulta)
    detalle_movimiento = resultado.scalar_one_or_none()

    if detalle_movimiento is None:
        raise HTTPException(
            status_code=404,
            detail="Informacion no encontrado"
        )
    try:
        db.delete(detalle_movimiento)
        db.commit()
        return {"detail": "Informacion eliminada correctamente"}
    except Exception:
        db.rollback()
        raise