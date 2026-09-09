from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from app.dependencies.auth import get_db, obtener_usuario_actual, requerir_rol
from app.models.movimiento import Movimiento
from app.models.detalle_movimiento import DetalleMovimiento
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.schemas.movimiento import MovimientoCreate, MovimientoResponse

router = APIRouter(prefix="/movimientos", tags=["Movimiento"])

# GET: Obtener lista de movimientos (con filtros opcionales por tipo)
@router.get("/filtrar", response_model=list[MovimientoResponse])
def obtener_movimientos(
    tipo: str | None = Query(default=None, description="Filtrar por ENTRADA, " \
    "SALIDA o DEVOLUCION CLIENTE - PROVEEDOR"),
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
):
    consulta = (
        select(Movimiento)
        .options(
            joinedload(Movimiento.detalles).joinedload(DetalleMovimiento.producto)
        )
        .order_by(Movimiento.fecha.desc())
    )

    if tipo:
        consulta = consulta.where(Movimiento.tipo == tipo.upper())

    resultado = db.execute(consulta)
    return resultado.scalars().unique().all()

# GET: Obtener un movimiento por ID con sus detalles y productos
@router.get("/filtrar ID/{movimiento_id}", response_model=MovimientoResponse)
def obtener_movimiento(
    movimiento_id: int, 
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    consulta = (
        select(Movimiento)
        .options(
            joinedload(Movimiento.detalles).joinedload(DetalleMovimiento.producto)
        )
        .where(Movimiento.id == movimiento_id)
    )
    resultado = db.execute(consulta)
    movimiento = resultado.scalars().unique().scalar_one_or_none()

    if movimiento is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimiento no encontrado"
        )
    
    return movimiento

# POST: Crear un movimiento con sus detalles y actualizar stock
@router.post("/crear", response_model=MovimientoResponse, status_code=status.HTTP_201_CREATED)
def crear_movimiento(
    movimiento_data: MovimientoCreate,
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):
    #Validar reglas de proveedor según el tipo
    proveedor_id_final = movimiento_data.proveedor_id

    if movimiento_data.tipo in ("ENTRADA", "DEVOLUCION PROVEEDOR"):
        if proveedor_id_final is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El tipo '{movimiento_data.tipo}' requiere un proveedor asignado"
            )
        proveedor = db.get(Proveedor, proveedor_id_final)
        if proveedor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El proveedor no existe"
            )
        if not proveedor.activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Un proveedor inactivo no puede ser seleccionado para este movimiento"
            )
    else:

        proveedor_id_final = movimiento_data.proveedor_id

    #Validar que no se repita el mismo producto en el payload
    ids_productos = [item.producto_id for item in movimiento_data.detalles]
    if len(ids_productos) != len(set(ids_productos)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes incluir el mismo producto más de una vez. Unifica las cantidades en una sola línea."
        )

    #Instanciar la cabecera del movimiento con el usuario del JWT
    movimiento = Movimiento(
        tipo=movimiento_data.tipo,
        motivo=movimiento_data.motivo,
        usuario_id=usuario_actual.id,
        proveedor_id=proveedor_id_final,
        costo_total=Decimal("0.00")
    )

    costo_total_acumulado = Decimal("0.00")

    #Procesar líneas y actualizar stock
    for detalle_data in movimiento_data.detalles:
        producto = db.get(Producto, detalle_data.producto_id)
        if producto is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El producto con ID {detalle_data.producto_id} no existe"
            )

        if not producto.activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto '{producto.nombre}' está desactivado y no puede registrar movimientos"
            )

        stock_anterior = Decimal(producto.stock_actual)
        cantidad = Decimal(detalle_data.cantidad)

        if movimiento_data.tipo in ("ENTRADA", "DEVOLUCION CLIENTE"):
            stock_nuevo = stock_anterior + cantidad
        elif movimiento_data.tipo in ("SALIDA", "DEVOLUCION PROVEEDOR"):
            if stock_anterior < cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Stock insuficiente para '{producto.nombre}'. Stock actual: {stock_anterior}, solicitado: {cantidad}"
                )
            stock_nuevo = stock_anterior - cantidad
        elif movimiento_data.tipo == "AJUSTE":
            stock_nuevo = cantidad
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tipo de movimiento no soportado: {movimiento_data.tipo}"
            )

        subtotal = cantidad * detalle_data.costo_unitario
        costo_total_acumulado += subtotal

        producto.stock_actual = stock_nuevo

        detalle = DetalleMovimiento(
            producto_id=detalle_data.producto_id,
            cantidad=cantidad,
            costo_unitario=detalle_data.costo_unitario,
            subtotal=subtotal,
            stock_anterior=stock_anterior,
            stock_nuevo=stock_nuevo
        )
        movimiento.detalles.append(detalle)

    movimiento.costo_total = costo_total_acumulado

    try:
        db.add(movimiento)
        db.commit()
        db.refresh(movimiento)

        consulta = (
            select(Movimiento)
            .options(
                joinedload(Movimiento.detalles).joinedload(DetalleMovimiento.producto)
            )
            .where(Movimiento.id == movimiento.id)
        )
        return db.execute(consulta).scalars().unique().one()

    except Exception:
        db.rollback()
        raise