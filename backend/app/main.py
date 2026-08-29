from fastapi import FastAPI, Depends
from app.database.connection import get_db
from sqlalchemy import select
from app.models.producto import Producto
from app.schemas.producto import ProductoResponse


app = FastAPI()

@app.get("/")
def inicio(db = Depends(get_db)):
    return {"mensaje": "API de inventario funcionando"}

@app.get("/productos", response_model=list[ProductoResponse])
def obtener_productos(db = Depends(get_db)):
    consulta = select(Producto)
    resultado = db.execute(consulta)
    productos = resultado.scalars().all()

    return productos