from secrets import randbelow
from pathlib import Path
from os import getenv

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent

load_dotenv(ROOT_DIR / ".env")

ASSOCIATION_CODE_LENGTH = 6


def generate_association_code() -> str:
    """
    Código numérico aleatório de 6 dígitos (com zeros à esquerda), usando
    uma fonte criptograficamente segura. A unicidade é garantida por quem
    grava (índice único em `managers.association_code`)
    """
    code: int = randbelow(10 ** ASSOCIATION_CODE_LENGTH)

    return f"{code:0{ASSOCIATION_CODE_LENGTH}d}"


DEFAULT_IDLE_SECONDS = 300
MAX_IDLE_SECONDS = int(getenv("MAX_IDLE_SECONDS", DEFAULT_IDLE_SECONDS))
