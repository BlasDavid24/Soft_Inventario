from pwdlib import PasswordHash
import string
import secrets

password_hash = PasswordHash.recommended()

def hash_password(password: str):

    return password_hash.hash(password)


def verify_password(password: str, hash_guardado: str):

    return password_hash.verify(password, hash_guardado)

def generar_password_temporal(longitud=10):
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(longitud))