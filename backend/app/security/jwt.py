from datetime import datetime, timedelta, timezone
import jwt

#Firma digital del token
SECRET_KEY = "clave_secreta_segura_para_el_inventario"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8


def crear_token_acceso(datos: dict) -> str:
    payload = datos.copy()
    
    #Le agregamos una fecha de caducidad exacta en tiempo UTC
    tiempo_expiracion = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": tiempo_expiracion})
    
    #Firmamos y generamos el string largo del token
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


def decodificar_token(token: str) -> dict | None:
    try:
        # Verifica que la firma sea legítima y que no haya expirado
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None