from fastapi import Depends, HTTPException
from app.dependencies import get_db
from sqlalchemy import select
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoResponse, ProductoUpdate, ProductoActivo
from fastapi import APIRouter
from app.models.categoria import Categoria
from sqlalchemy.orm import joinedload


router = APIRouter()

#PRODUCTO

#GET solicitar/obtener un recurso
@router.get("/productos", response_model=list[ProductoResponse])
def obtener_productos(db = Depends(get_db)):

    consulta = select(Producto).options(joinedload(Producto.categoria))
    resultado = db.execute(consulta)
    productos = resultado.scalars().all()

    return productos

#GET solicitar/obtener un recurso por id
@router.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db=Depends(get_db)):
    consulta = select(Producto).options(joinedload(Producto.categoria)).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()


    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )
    
    return producto

#POST crea un recurso
@router.post("/productos", response_model=ProductoResponse)
def crear_producto(
    producto_data: ProductoCreate,
    db = Depends(get_db)
):
    consulta = select(Producto).where(Producto.sku == producto_data.sku)
    resultado = db.execute(consulta)
    sku_existente = resultado.scalar_one_or_none()

    producto = Producto(
        nombre=producto_data.nombre,
        sku=producto_data.sku,
        precio=producto_data.precio,
        uni_medida=producto_data.uni_medida,
        stock_actual=producto_data.stock_actual,
        stock_minimo=producto_data.stock_minimo,
        categoria_id=producto_data.categoria_id
    )

    if sku_existente is not None:
        raise HTTPException(
            status_code=409,
            detail= f"El SKU '{producto_data.sku}' ya existe"
        )

    #Consultamos si el ID categoria ya existe en la bd
    consulta_id_existente = select(Categoria).where(Categoria.id == producto_data.categoria_id)
    resultado_id_existente = db.execute(consulta_id_existente)
    id_existente = resultado_id_existente.scalar_one_or_none()

    if id_existente is None:
        raise HTTPException(
            status_code=404,
            detail= f"La categoria no existe"
        )

    try:
        db.add(producto)
        db.commit()
        db.refresh(producto)
        
        return producto

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/productos/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: int, producto_data: ProductoUpdate, db = Depends(get_db)):
    

    consulta = select(Producto).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )
    
    #Consultamos si el ID categoria ya existe en la bd
    consulta_sku_existente = select(Producto).where(Producto.sku == producto_data.sku,
    Producto.id != producto_id)
    resultado_sku_existente = db.execute(consulta_sku_existente)
    sku_existente = resultado_sku_existente.scalar_one_or_none()

    if sku_existente is not None:
        raise HTTPException(
            status_code=409,
            detail= f"El SKU '{producto_data.sku}' ya existe"
        )
    
   
    datos_actualizados = producto_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(producto, campo, valor)

    #SE busca si la categoria existe o no
    consulta_categoria = select(Categoria).where(Categoria.id == producto_data.categoria_id)
    resultado_categoria = db.execute(consulta_categoria)
    categoria_existente = resultado_categoria.scalar_one_or_none()
        
    if "categoria_id" in datos_actualizados:
        if categoria_existente is None:
            raise HTTPException(
                status_code=404,
                detail= f"La categoria no existe"
                )

    try:
        db.commit()
        db.refresh(producto)

        return producto

    except Exception:
        db.rollback()
        raise

#PATCH sirve para actualizar parcialmente un recurso
@router.patch("/productos/{producto_id}", response_model=ProductoResponse)
def activar_desactivar_producto(
        producto_id: int, producto_data: ProductoActivo,
        db=Depends(get_db)
    ):

    consulta = select(Producto).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto.activo = producto_data.activo

    
    try:
        db.commit()
        db.refresh(producto)
    
        return producto
    
    except Exception:
        db.rollback()
        raise