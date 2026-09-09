from fastapi import Depends, HTTPException
from app.dependencies.auth import get_db, requerir_rol, obtener_usuario_actual
from sqlalchemy import select, and_
from app.models.proveedor_producto import ProveedorProducto
from app.models.proveedor import Proveedor
from app.models.producto import Producto
from sqlalchemy.orm import joinedload
from app.schemas.proveedor_producto import ProvProducResponse, ProvProducCreate, ProvProducUpdate
from fastapi import APIRouter, Query
from app.models.usuario import Usuario

router = APIRouter(prefix="/proveedor-producto", tags=["Proveedor Producto"])

# GET solicitar/obtener recursos (con filtros opcionales por producto o proveedor)
@router.get("/filtrar", response_model=list[ProvProducResponse])
def obtener_proveedor_productos(
    producto_id: int | None = Query(default=None, description="Filtrar por ID de producto"),
    proveedor_id: int | None = Query(default=None, description="Filtrar por ID de proveedor"),
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    consulta = select(ProveedorProducto).options(
        joinedload(ProveedorProducto.producto),
        joinedload(ProveedorProducto.proveedor)
    )

    if producto_id is not None:
        consulta = consulta.where(ProveedorProducto.producto_id == producto_id)
    else:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )
        
    if proveedor_id is not None:
        consulta = consulta.where(ProveedorProducto.proveedor_id == proveedor_id)
    else: 
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )
        

    resultado = db.execute(consulta)
    provee_produc = resultado.scalars().unique().all()

    return provee_produc

#GET solicitar/obtener un recurso por id
@router.get("/filtrar ID/{prov_produc_id}", response_model=ProvProducResponse)
def obtener_proveedor_producto(
    prov_produc_id: int, 
    db=Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
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
@router.post("/crear", response_model=ProvProducResponse)
def crear_proveedor_producto(
    provee_produc_data: ProvProducCreate,
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):

    #Verificamos que proveedor exista o este inactivo
    proveedor = db.get(Proveedor, provee_produc_data.proveedor_id)
    if proveedor is None:
            raise HTTPException(
                status_code=404,
                detail=f"El proveedor no existe"
        )
    
    if not proveedor.activo:
        raise HTTPException(
            status_code=400,
            detail="No se puede vincular un proveedor inactivo"
        )
    
    #Verificamos que producto exista o este inactivo
    producto = db.get(Producto, provee_produc_data.producto_id)
    if producto is None:
            raise HTTPException(
                status_code=404,
                detail=f"El producto no existe"
        )

    if not producto.activo:
        raise HTTPException(
            status_code=400,
            detail="No se puede vincular un producto inactivo"
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
@router.put("/editar/{prov_produc_id}", response_model=ProvProducResponse)
def actualizar_proveedor_producto(
    prov_produc_id: int, 
    proveedor_producto_data: ProvProducUpdate, 
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):
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
        raise HTTPException(
            status_code=409,
            detail="Esta combinación de proveedor y producto ya existe"
        )

#DELETE sirve para eliminar un recurso
@router.delete("/eliminar/{prov_produc_id}")
def eliminar_proveedor_producto(
        prov_produc_id: int,
        db=Depends(get_db),
        usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
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