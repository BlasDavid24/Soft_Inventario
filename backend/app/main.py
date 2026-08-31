from fastapi import FastAPI, Depends
from app.routers import productos
from app.routers import categorias

app = FastAPI()

app.include_router(productos.router)
app.include_router(categorias.router)