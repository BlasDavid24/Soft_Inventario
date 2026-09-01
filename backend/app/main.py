from fastapi import FastAPI, Depends
from app.routers import productos
from app.routers import categorias
from app.routers import proveedor
from app.routers import proveedor_producto

app = FastAPI()

app.include_router(productos.router)
app.include_router(categorias.router)
app.include_router(proveedor.router)
app.include_router(proveedor_producto.router)