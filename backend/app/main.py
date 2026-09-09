from fastapi import FastAPI
from app.routers import (productos, categorias, proveedores, proveedor_productos, usuarios, 
movimientos, auth)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sistema de Gestión de Inventario",
    version="1.0.0"
)

#Define los orígenes permitidos
origins = [
    "http://localhost:3000",      # Típico de Create React App / Next.js
    "http://localhost:5173",      # Típico de Vite (React, Vue, Svelte)
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000", # En desarrollo temprano, si pruebas con Live Server u otros puertos:
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

#Agregar el middleware a la aplicación
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Dominios autorizados a consultar la API
    allow_credentials=True,           # Permite cookies y encabezados de autenticación
    allow_methods=["*"],              # Permite todos los métodos HTTP (GET, POST, PUT, PATCH, DELETE, OPTIONS)
    allow_headers=["*"],              # Permite todos los encabezados (Authorization, Content-Type, etc.)
)

app.include_router(productos.router)
app.include_router(categorias.router)
app.include_router(proveedores.router)
app.include_router(proveedor_productos.router)
app.include_router(usuarios.router)
app.include_router(movimientos.router)
app.include_router(auth.router)


