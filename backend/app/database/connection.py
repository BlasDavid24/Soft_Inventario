from dotenv import load_dotenv
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Obtenemos los datos necesarios para conectarnos a PostgreSQL

load_dotenv()

db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")

DATABASE_URL = (
    f"postgresql+psycopg://{db_user}:{db_password}"
    f"@{db_host}:{db_port}/{db_name}"
)

# Creamos el Engine que SQLAlchemy utilizará para gestionar las conexiones
engine = create_engine(DATABASE_URL)

# Creamos una fábrica de sesiones asociada a nuestro Engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

