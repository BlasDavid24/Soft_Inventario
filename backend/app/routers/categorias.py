from fastapi import Depends, HTTPException
from app.dependencies.auth import get_db, requerir_rol, obtener_usuario_actual
from sqlalchemy import select
from fastapi import APIRouter, Query
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaResponse, CategoriaCreate, CategoriaUpdate
from app.models.usuario import Usuario

router = APIRouter(prefix="/categorias", tags=["Categoria"])

#CATEGORIA

#GET solicta/obtiene un recurso por nombre
@router.get("/filtar", response_model=list[CategoriaResponse])
def obtener_categorias(
    buscar: str | None = Query(default=None, description="Buscar por nombre"),
    db = Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    
    consulta = select(Categoria)

    if buscar:
        termino = f"%{buscar.strip()}%"
        consulta = consulta.where(Categoria.nombre.ilike(termino))
        
    resultado = db.execute(consulta)
    categoria = resultado.scalars().all()

    return categoria

#GET solicitar/obtener un recurso por id
@router.get("/filtrar ID/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(
    categoria_id: int, 
    db=Depends(get_db),
    usuario_actual: Usuario = Depends(obtener_usuario_actual)
):
    consulta = select(Categoria).where(Categoria.id == categoria_id)
    resultado = db.execute(consulta)
    categoria = resultado.scalar_one_or_none()


    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="Categoria no encontrada"
        )
    
    return categoria

#POST crea un recurso
@router.post("/crear", response_model=CategoriaResponse)
def crear_categoria(

    categoria_data: CategoriaCreate,
    db = Depends(get_db),
    usuario_encargado: Usuario = Depends(requerir_rol(["ENCARGADO"]))
):
    consulta = select(Categoria).where(Categoria.nombre == categoria_data.nombre)
    resultado = db.execute(consulta)
    nombre_existente = resultado.scalar_one_or_none()

    categoria = Categoria(
        nombre=categoria_data.nombre,

    )

    if nombre_existente is not None:
        raise HTTPException(
            status_code=409,
            detail= f"El nombre '{categoria_data.nombre}' ya existe"
        )

    try:
        db.add(categoria)
        db.commit()
        db.refresh(categoria)
        
        return categoria

    except Exception:
        db.rollback()
        raise

#PUT actualizar un recurso
@router.put("/editar/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(
    categoria_id: int, 
    categoria_data: CategoriaUpdate, 
    db = Depends(get_db),
    usuario_admin: Usuario = Depends(requerir_rol(["ADMINISTRADOR"]))
):
    consulta = select(Categoria).where(Categoria.id == categoria_id)
    resultado = db.execute(consulta)
    categoria = resultado.scalar_one_or_none()
    datos_actualizados = categoria_data.model_dump(exclude_unset=True)

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="categoria no encontrada"
         )

    #Consultamos si un nombre ya existe en la bd
    if "nombre" in datos_actualizados:
        consulta_duplicado = select(Categoria).where(Categoria.nombre == categoria_data.nombre,
        Categoria.id != categoria_id)
        resultado_duplicado = db.execute(consulta_duplicado)
        duplicado = resultado_duplicado.scalar_one_or_none()
    
        if duplicado is not None:
            raise HTTPException(
                status_code=409,
                detail="Categoria ya existe"
            )
    
    
    for campo, valor in datos_actualizados.items():
        setattr(categoria, campo, valor)

    
    
    try:
        db.commit()
        db.refresh(categoria)

        return categoria

    except Exception:
        db.rollback()
        raise