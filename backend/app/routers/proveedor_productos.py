from fastapi import Depends, HTTPException
from app.dependencies import get_db
from sqlalchemy import select, and_
from app.models.proveedor_producto import ProveedorProducto
from app.models.proveedor import Proveedor
from app.models.producto import Producto
from sqlalchemy.orm import joinedload
from app.schemas.proveedor_producto import ProvProducResponse, ProvProducCreate, ProvProducUpdate
from fastapi import APIRouter

router = APIRouter()

#GET solicitar/obtener un recurso
@router.get("/proveedor_productos", response_model=list[ProvProducResponse])
def obtener_proveedor_productos(db = Depends(get_db)):

    consulta = select(ProveedorProducto).options(
            joinedload(ProveedorProducto.producto),
            joinedload(ProveedorProducto.proveedor)
        )
    resultado = db.execute(consulta)
    provee_produc = resultado.scalars().all()

    return provee_produc

#GET solicitar/obtener un recurso por id
@router.get("/proveedor_productos/{prov_produc_id}", response_model=ProvProducResponse)
def obtener_proveedor_producto(prov_produc_id: int, db=Depends(get_db)):
    consulta = select(ProveedorProducto).options(
            joinedload(ProveedorProducto.producto),
            joinedload(ProveedorProducto.proveedor)
        ).where(ProveedorProducto.id == prov_produc_id)
    resultado = db.execute(consulta)
    proveedor = resultado.scalar_one_or_none()


    if proveedor is None:
        raise HTTPException(
            status_code=404,
            detail="Datos no encontrados"
        )
    
    return proveedor

#POST crea un recurso
@router.post("/proveedor_productos", response_model=ProvProducResponse)
def crear_proveedor_producto(
     
    provee_produc_data: ProvProducCreate,
    db = Depends(get_db)
):

    #Verificamos que proveedor exista
    proveedor = db.get(Proveedor, provee_produc_data.proveedor_id)
    if proveedor is None:
            raise HTTPException(
                status_code=404,
                detail=f"El proveedor no existe"
        )
    #Verificamos que producto exista
    producto = db.get(Producto, provee_produc_data.producto_id)
    if producto is None:
            raise HTTPException(
                status_code=404,
                detail=f"El producto no existe"
        )

    #Verficamos que proveedor y producto no existan
    consulta = select(ProveedorProducto).where(
    and_(
        ProveedorProducto.proveedor_id == provee_produc_data.proveedor_id,
        ProveedorProducto.producto_id == provee_produc_data.producto_id
    )
)
    resultado = db.execute(consulta)
    datos_existentes = resultado.scalar_one_or_none()

    if datos_existentes is not None:
        raise HTTPException(
            status_code=409,
            detail=f"El proveedor '{proveedor.nombre}' y el producto '{producto.nombre}' ya estan vinculados"
    )


    proveedor_producto = ProveedorProducto(
        costo_compra=provee_produc_data.costo_compra,
        producto_id=provee_produc_data.producto_id,
        proveedor_id=provee_produc_data.proveedor_id,
    )



    try:
        db.add(proveedor_producto)
        db.commit()
        db.refresh(proveedor_producto)
        
        return proveedor_producto

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/proveedor_productos/{prov_produc_id}", response_model=ProvProducResponse)
def actualizar_proveedor_producto(prov_produc_id: int, proveedor_producto_data: ProvProducUpdate, db = Depends(get_db)):
    consulta = select(ProveedorProducto).where(ProveedorProducto.id == prov_produc_id)
    resultado = db.execute(consulta)
    proveedor_producto = resultado.scalar_one_or_none()

    if proveedor_producto is None:
            raise HTTPException(
                status_code=404,
                detail="Informacion no encontrado"
            )
    
    datos_actualizados = proveedor_producto_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(proveedor_producto, campo, valor)

    try:
        db.commit()
        db.refresh(proveedor_producto)

        return proveedor_producto

    except Exception:
        db.rollback()
        raise

#DELETE sirve para eliminar un recurso
@router.delete("/proveedor_productos/{prov_produc_id}")
def eliminar_proveedor_producto(
        prov_produc_id: int,
        db=Depends(get_db)
    ):

    consulta = select(ProveedorProducto).where(ProveedorProducto.id == prov_produc_id)
    resultado = db.execute(consulta)
    proveedor_producto = resultado.scalar_one_or_none()

    if proveedor_producto is None:
        raise HTTPException(
            status_code=404,
            detail="Informacion no encontrado"
        )
    try:
        db.delete(proveedor_producto)
        db.commit()
        return {"detail": "Relacion eliminada correctamente"}
    except Exception:
        db.rollback()
        raise