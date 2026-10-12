import os
import tempfile
from pathlib import Path

# As variáveis precisam ser definidas ANTES de importar `app`, que cria o
# engine e lê a configuração de JWT no import
# Atribuição direta (não setdefault) para que um .env local nunca aponte
# os testes para o Postgres
_TMP_DIR = tempfile.mkdtemp(prefix="timetracker-tests-")
os.environ["DATABASE_URL"] = f"sqlite:///{Path(_TMP_DIR) / 'test.db'}"
os.environ["JWT_SECRET_KEY"] = "chave-de-teste-com-mais-de-32-caracteres!!"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

import pytest  # noqa: E402
from fastapi import status
from fastapi.testclient import TestClient  # noqa: E402

from app.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402

MANAGER_EMAIL = "gestor@example.com"
MANAGER_PASSWORD = "senha-segura-123"


@pytest.fixture()
def db():
    """Banco limpo a cada teste."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(db):
    return TestClient(app)


@pytest.fixture()
def registered_manager(client):
    response = client.post(
        "/auth/register",
        json={"email": MANAGER_EMAIL, "password": MANAGER_PASSWORD},
    )
    assert response.status_code == status.HTTP_201_CREATED

    return response.json()


@pytest.fixture()
def auth_headers(client, registered_manager):
    response = client.post(
        "/auth/login",
        json={"email": MANAGER_EMAIL, "password": MANAGER_PASSWORD},
    )
    assert response.status_code == status.HTTP_200_OK

    return {"Authorization": f"Bearer {response.json()['access_token']}"}
