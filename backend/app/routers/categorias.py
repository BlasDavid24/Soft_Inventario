from fastapi import Depends, HTTPException
from app.dependencies import get_db
from sqlalchemy import select
from fastapi import APIRouter
from app.models.categoria import Categoria
from app.schemas.categoria import CategoriaResponse, CategoriaCreate, CategoriaUpdate

router = APIRouter()

#CATEGORIA

#GET solicta/obtiene un recurso
@router.get("/categorias", response_model=list[CategoriaResponse])
def obtener_categorias(db = Depends(get_db)):
    consulta = select(Categoria)
    resultado = db.execute(consulta)
    categoria = resultado.scalars().all()

    return categoria

#GET solicitar/obtener un recurso por id
@router.get("/categorias/{categoria_id}", response_model=CategoriaResponse)
def obtener_categoria(categoria_id: int, db=Depends(get_db)):
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
@router.post("/categorias", response_model=CategoriaResponse)
def crear_categoria(

    categoria_data: CategoriaCreate,
    db = Depends(get_db)
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
@router.put("/categorias/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(categoria_id: int, categoria_data: CategoriaUpdate, db = Depends(get_db)):
    consulta = select(Categoria).where(Categoria.id == categoria_id)
    resultado = db.execute(consulta)
    categoria = resultado.scalar_one_or_none()

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="categoria no encontrada"
         )

    #Consultamos si un nombre ya existe en la bd
    consulta_duplicado = select(Categoria).where(Categoria.nombre == categoria_data.nombre,
    Categoria.id != categoria_id)
    resultado_duplicado = db.execute(consulta_duplicado)
    duplicado = resultado_duplicado.scalar_one_or_none()
    
    if duplicado is not None:
        raise HTTPException(
            status_code=409,
            detail="Categoria ya existe"
        )
    
    datos_actualizados = categoria_data.model_dump(exclude_unset=True)
    for campo, valor in datos_actualizados.items():
        setattr(categoria, campo, valor)

    
    
    try:
        db.commit()
        db.refresh(categoria)

        return categoria

    except Exception:
        db.rollback()
        raise