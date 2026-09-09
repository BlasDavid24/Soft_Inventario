from fastapi import Depends, HTTPException
from app.dependencies.auth import get_db, requerir_rol, obtener_usuario_actual
from sqlalchemy import select, or_
from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoResponse, ProductoUpdate, ProductoActivo
from fastapi import APIRouter, Query
from app.models.categoria import Categoria
from sqlalchemy.orm import joinedload
from decimal import Decimal
from app.models.usuario import Usuario


router = APIRouter(prefix="/productos", tags=["Producto"])

#PRODUCTO

# GET solicitar/obtener un recurso (con búsqueda y filtros agregados)
@router.get("/filtrar", response_model=list[ProductoResponse])
def obtener_productos(
    buscar: str | None = Query(default=None, description="Buscar por nombre o SKU"),
    categoria_id: int | None = Query(default=None, description="Filtrar por categoría"),
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    consulta = select(Producto).options(joinedload(Producto.categoria))

    # Filtro por búsqueda de nombre o SKU
    if buscar:
        termino = f"%{buscar.strip()}%"
        consulta = consulta.where(
            or_(
                Producto.nombre.ilike(termino),
                Producto.sku.ilike(termino)
            )
        )

    # Filtro por categoría
    if categoria_id is not None:
        consulta = consulta.where(Producto.categoria_id == categoria_id)

    resultado = db.execute(consulta)
    productos = resultado.scalars().unique().all()

    return productos

#GET solicitar/obtener un recurso por id
@router.get("/filtrar ID/{producto_id}", response_model=ProductoResponse)
def obtener_producto(
    producto_id: int, 
    db=Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
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
@router.post("/crear", response_model=ProductoResponse)
def crear_producto(
    producto_data: ProductoCreate,
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):
    if producto_data.uni_medida == "unidad" and (Decimal(str(
        producto_data.stock_actual)) % 1 != 0 or Decimal(str(producto_data.stock_minimo)) % 1 != 0):
        raise HTTPException(
            status_code=400,
            detail="Los productos medidos en 'unidad' no admiten decimales en el stock"
        )
    
    consulta = select(Producto).where(Producto.sku == producto_data.sku)
    resultado = db.execute(consulta)
    sku_existente = resultado.scalar_one_or_none()

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
    
    producto = Producto(
        nombre=producto_data.nombre,
        sku=producto_data.sku,
        precio=producto_data.precio,
        uni_medida=producto_data.uni_medida,
        stock_actual=producto_data.stock_actual,
        stock_minimo=producto_data.stock_minimo,
        categoria_id=producto_data.categoria_id
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
@router.put("/editar/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(
    producto_id: int, 
    producto_data: ProductoUpdate, 
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):

    consulta = select(Producto).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()
    datos_actualizados = producto_data.model_dump(exclude_unset=True)

    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )
    
    #Consultamos si existe el sku
    if "sku" in datos_actualizados:
        consulta_sku_existente = select(Producto).where(Producto.sku == producto_data.sku,
        Producto.id != producto_id)
        resultado_sku_existente = db.execute(consulta_sku_existente)
        sku_existente = resultado_sku_existente.scalar_one_or_none()

        if sku_existente is not None:
            raise HTTPException(
                status_code=409,
                detail= f"El SKU '{producto_data.sku}' ya existe"
            )

    
    #Se busca si la categoria existe o no
    if "categoria_id" in datos_actualizados:
        consulta_categoria = select(Categoria).where(Categoria.id == producto_data.categoria_id)
        resultado_categoria = db.execute(consulta_categoria)
        categoria_existente = resultado_categoria.scalar_one_or_none()
        if categoria_existente is None:
            raise HTTPException(
                status_code=404,
                detail= "La categoria no existe"
                )

    #Valida unidad de medida si viene en la petición
    unidad = datos_actualizados.get("uni_medida", producto.uni_medida).lower()
    if unidad not in ("unidad", "kg"):
        raise HTTPException(
            status_code=400,
            detail="La unidad de medida debe ser 'unidad' o 'kg'"
        )

    stock_act = datos_actualizados.get("stock_actual", producto.stock_actual)
    stock_min = datos_actualizados.get("stock_minimo", producto.stock_minimo)
    if unidad == "unidad" and (Decimal(str(stock_act)) % 1 != 0 or Decimal(str(stock_min)) % 1 != 0):
        raise HTTPException(
            status_code=400,
            detail="Los productos medidos en 'unidad' no admiten decimales en el stock"
        )

    for campo, valor in datos_actualizados.items():
        setattr(producto, campo, valor)

    try:
        db.commit()
        db.refresh(producto)

        return producto

    except Exception:
        db.rollback()
        raise

#PATCH sirve para actualizar parcialmente un recurso
@router.patch("/desactivar/{producto_id}", response_model=ProductoResponse)
def activar_desactivar_producto(
        producto_id: int, producto_data: ProductoActivo,
        db=Depends(get_db),
        usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
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