from fastapi import FastAPI, Depends
from app.database.connection import get_db
from sqlalchemy import select
from app.models.producto import Producto
from app.models.categoria import Categoria
from app.schemas.producto import ProductoCreate, ProductoResponse, ProductoUpdate
from app.schemas.categoria import CategoriaResponse
from fastapi import FastAPI, Depends, HTTPException


app = FastAPI()


#PRODUCTO

#GET solicitar/obtener un recurso
@app.get("/productos", response_model=list[ProductoResponse])
def obtener_productos(db = Depends(get_db)):

    consulta = select(Producto)
    resultado = db.execute(consulta)
    productos = resultado.scalars().all()

    return productos

#GET solicitar/obtener un recurso por id
@app.get("/productos/{producto_id}", response_model=ProductoResponse)
def obtener_producto(producto_id: int, db=Depends(get_db)):
    consulta = select(Producto).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()


    if producto is None:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )
    
    return producto

#POST crea un recurso
@app.post("/productos", response_model=ProductoResponse)
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
                    detail= f"El SKU '{producto.sku}' ya existe"
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
@app.put("/productos/{producto_id}", response_model=ProductoResponse)
def actualizar_producto(producto_id: int, producto_data: ProductoUpdate, db = Depends(get_db)):
    consulta = select(Producto).where(Producto.id == producto_id)
    resultado = db.execute(consulta)
    producto = resultado.scalar_one_or_none()

    if producto is None:
            raise HTTPException(
                status_code=404,
                detail="Producto no encontrado"
            )
    
    datos_actualizados = producto_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(producto, campo, valor)

    try:
        db.commit()
        db.refresh(producto)

        return producto

    except Exception:
        db.rollback()
        raise

#DELETE sirve para eliminar un recurso
@app.delete("/productos/{producto_id}")
def eliminar_producto(
        producto_id: int,
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
    try:
        db.delete(producto)
        db.commit()
        return {"detail": "Producto eliminado correctamente"}
    except Exception:
        db.rollback()
        raise

#CATEGORIA
@app.get("/categorias", response_model=list[CategoriaResponse])
def obtener_categorias(db = Depends(get_db)):
    consulta = select(Categoria)
    resultado = db.execute(consulta)
    categorias = resultado.scalars().all()

    return categorias