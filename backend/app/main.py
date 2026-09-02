from fastapi import FastAPI
from app.routers import productos, categorias, proveedores, proveedor_productos, usuarios

app = FastAPI()

app.include_router(productos.router)
app.include_router(categorias.router)
app.include_router(proveedores.router)
app.include_router(proveedor_productos.router)
app.include_router(usuarios.router)