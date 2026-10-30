import uuid
from datetime import timedelta

import jwt
import pytest
from fastapi import status
from sqlalchemy import create_engine, inspect, text

from app import models, rate_limit, security
from app.rate_limit import FailedAttemptLimiter, association_limiter
from app.schema_upgrades import apply_schema_upgrades

from .conftest import MANAGER_EMAIL, MANAGER_PASSWORD

URL = "/collaborators/associate"


@pytest.fixture(autouse=True)
def _reset_limiter():
    association_limiter.reset()

    yield

    association_limiter.reset()


def _register(client, email) -> dict:
    response = client.post(
        "/auth/register", json={"email": email, "password": MANAGER_PASSWORD}
    )

    assert response.status_code == status.HTTP_201_CREATED

    return response.json()


def _code_of(db, email) -> str:
    return (
        db.query(models.Manager)
          .filter(models.Manager.email == email)
          .one()
          .association_code
    )


def _payload(code, username="joao", machine="PC-JOAO-01") -> dict:
    return {
        "association_code": code,
        "username": username,
        "machine_name": machine,
    }


@pytest.fixture()
def manager(client, db):
    body = _register(client, MANAGER_EMAIL)

    return {**body, "code": _code_of(db, MANAGER_EMAIL)}


def _wrong_code(db) -> str:
    used = {m.association_code for m in db.query(models.Manager).all()}

    return next(
        f"{n:06d}" for n in range(999_999, 0, -1) if f"{n:06d}" not in used
    )


# Sucesso
def test_codigo_correto_associa_e_retorna_200(client, db, manager):
    response = client.post(URL, json=_payload(manager["code"]))

    assert response.status_code == status.HTTP_200_OK

    body = response.json()

    assert body["manager_id"] == manager["id"]
    assert body["username"] == "joao"
    assert body["machine_name"] == "PC-JOAO-01"
    assert body["already_associated"] is False
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == security.AGENT_TOKEN_EXPIRE_MINUTES * 60

    user = db.query(models.User).one()

    assert str(user.id) == body["collaborator_id"]
    assert str(user.manager_id) == manager["id"]
    assert user.machine_name == "PC-JOAO-01"


def test_token_devolvido_e_de_agente_e_aponta_para_o_colaborador(
    client, db, manager
):
    body = client.post(URL, json=_payload(manager["code"])).json()

    assert (
        security.decode_agent_token(body["access_token"])
        == uuid.UUID(body["collaborator_id"])
    )


def test_vincula_colaborador_ja_existente_sem_gestor(client, db, manager):
    existing = models.User(username="joao")
    db.add(existing)
    db.commit()
    existing_id = existing.id

    response = client.post(URL, json=_payload(manager["code"]))

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["already_associated"] is False
    assert response.json()["collaborator_id"] == str(existing_id)
    assert db.query(models.User).count() == 1

    db.expire_all()

    assert str(db.get(models.User, existing_id).manager_id) == manager["id"]


def test_espacos_nas_pontas_do_usuario_sao_removidos(client, db, manager):
    response = client.post(
        URL, json=_payload(manager["code"], username="  maria  ")
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["username"] == "maria"


# Idempotência
def test_repetir_associacao_do_mesmo_gestor_revalida_sem_duplicar(
    client, db, manager
):
    first = client.post(URL, json=_payload(manager["code"])).json()
    second = client.post(
        URL, json=_payload(manager["code"], machine="PC-NOVO")
    )

    assert second.status_code == status.HTTP_200_OK

    body = second.json()

    assert body["already_associated"] is True
    assert body["collaborator_id"] == first["collaborator_id"]
    assert body["machine_name"] == "PC-NOVO"
    assert security.decode_agent_token(body["access_token"])
    assert db.query(models.User).count() == 1


# Falhas
def test_codigo_incorreto_retorna_404_e_nao_persiste_nada(
    client, db, manager
):
    response = client.post(URL, json=_payload(_wrong_code(db)))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "access_token" not in response.text
    assert db.query(models.User).count() == 0


def test_codigo_incorreto_nao_altera_colaborador_existente(
    client, db, manager
):
    client.post(URL, json=_payload(manager["code"]))

    response = client.post(
        URL, json=_payload(_wrong_code(db), machine="OUTRA-MAQUINA")
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND

    user = db.query(models.User).one()
    db.refresh(user)

    assert user.machine_name == "PC-JOAO-01"
    assert str(user.manager_id) == manager["id"]


@pytest.mark.parametrize(
    "payload",
    [
        {"association_code": "12345", "username": "a", "machine_name": "b"},
        {"association_code": "1234567", "username": "a", "machine_name": "b"},
        {"association_code": "abcdef", "username": "a", "machine_name": "b"},
        {"association_code": "123456", "username": "  ", "machine_name": "b"},
        {"association_code": "123456", "username": "a", "machine_name": ""},
        {"association_code": "123456", "username": "a\nb", "machine_name": "b"},
        {"association_code": "123456", "username": "x" * 151,
         "machine_name": "b"},
        {"association_code": "123456", "username": "a"},
        {"username": "a", "machine_name": "b"},
        {},
    ],
)
def test_entrada_invalida_retorna_422_sem_persistir(client, db, payload):
    response = client.post(URL, json=payload)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert db.query(models.User).count() == 0


def test_colaborador_de_outro_gestor_nao_e_transferido(client, db, manager):
    _register(client, "outro@example.com")
    other_code = _code_of(db, "outro@example.com")

    client.post(URL, json=_payload(manager["code"]))

    response = client.post(URL, json=_payload(other_code))

    assert response.status_code == status.HTTP_409_CONFLICT
    assert "access_token" not in response.text

    user = db.query(models.User).one()

    assert str(user.manager_id) == manager["id"]


def test_equipes_diferentes_recebem_colaboradores_distintos(client, db, manager):
    _register(client, "outro@example.com")
    other_code = _code_of(db, "outro@example.com")

    a = client.post(URL, json=_payload(manager["code"], username="ana")).json()
    b = client.post(URL, json=_payload(other_code, username="bia")).json()

    assert a["manager_id"] != b["manager_id"]


def test_corrida_no_mesmo_usuario_nao_gera_erro(client, db, manager, monkeypatch):
    """
    Duas associações simultâneas do mesmo usuário: a segunda perde a
    corrida no índice único, relê o registro e conclui normalmente
    """
    real_query = db.query
    state = {"hidden": True}

    from app import crud

    original = crud.associate_collaborator

    # Primeiro "enxerga" que o usuário não existe, mas ele já foi criado
    client.post(URL, json=_payload(manager["code"]))

    class _Empty:
        def filter(self, *_):
            return self

        def first(self):
            if state["hidden"]:
                state["hidden"] = False

                return None

            return real_query(models.User).filter(
                models.User.username == "joao"
            ).first()

    def fake_query(*entities):
        if entities == (models.User,) and state["hidden"]:
            return _Empty()

        return real_query(*entities)

    monkeypatch.setattr(db, "query", fake_query)

    user, already = original(db, manager["code"], "joao", "PC-JOAO-01")

    assert already is True
    assert db.query(models.User).count() == 1
    assert user.username == "joao"


# Limite de tentativas
def test_bloqueia_apos_muitas_tentativas_invalidas(client, db, manager):
    wrong = _wrong_code(db)

    for _ in range(association_limiter.max_failures):
        assert (
            client.post(URL, json=_payload(wrong)).status_code
            == status.HTTP_404_NOT_FOUND
        )

    blocked = client.post(URL, json=_payload(wrong))

    assert blocked.status_code == status.HTTP_429_TOO_MANY_REQUESTS
    assert int(blocked.headers["Retry-After"]) > 0

    # Mesmo o código certo fica barrado enquanto a origem está bloqueada
    assert (
        client.post(URL, json=_payload(manager["code"])).status_code
        == status.HTTP_429_TOO_MANY_REQUESTS
    )
    assert db.query(models.User).count() == 0


def test_tentativas_validas_nao_contam_para_o_bloqueio(client, db, manager):
    for _ in range(association_limiter.max_failures + 3):
        assert (
            client.post(URL, json=_payload(manager["code"])).status_code
            == status.HTTP_200_OK
        )


def test_limiter_libera_apos_a_janela():
    now = [0.0]
    limiter = FailedAttemptLimiter(3, 60, clock=lambda: now[0])

    for _ in range(3):
        limiter.register_failure("ip")

    assert limiter.retry_after("ip") is not None

    now[0] = 61

    assert limiter.retry_after("ip") is None


def test_limiter_separa_origens_e_limita_memoria(monkeypatch):
    limiter = FailedAttemptLimiter(1, 60)
    limiter.register_failure("a")

    assert limiter.retry_after("a") is not None
    assert limiter.retry_after("b") is None

    monkeypatch.setattr(rate_limit, "MAX_TRACKED_KEYS", 5)

    for index in range(20):
        limiter.register_failure(f"ip-{index}")

    assert len(limiter._failures) <= 5


# Token do agente
def test_token_de_agente_nao_vale_como_sessao_de_gestor(client, db, manager):
    body = client.post(URL, json=_payload(manager["code"])).json()

    response = client.get(
        "/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_token_de_gestor_nao_vale_como_token_de_agente(manager):
    manager_token = security.create_access_token(manager["id"])

    with pytest.raises(security.InvalidTokenError):
        security.decode_agent_token(manager_token)


def test_token_de_agente_expirado_ou_adulterado_e_rejeitado():
    user_id = uuid.uuid7()
    expired = security.create_agent_token(user_id, timedelta(seconds=-5))
    tampered = jwt.encode(
        {"sub": str(user_id), "aud": security.AGENT_JWT_AUDIENCE,
         "iat": 1, "exp": 9999999999},
        "outra-chave-qualquer-com-mais-de-32-caracteres",
        algorithm="HS256",
    )

    for token in (expired, tampered, "lixo"):
        with pytest.raises(security.InvalidTokenError):
            security.decode_agent_token(token)


def test_validade_do_token_de_agente_vem_da_configuracao():
    assert security._resolve_expire_minutes(
        None, default=7, name="AGENT_TOKEN_EXPIRE_MINUTES"
    ) == 7

    with pytest.raises(RuntimeError, match="AGENT_TOKEN_EXPIRE_MINUTES"):
        security._resolve_expire_minutes(
            "0", default=7, name="AGENT_TOKEN_EXPIRE_MINUTES"
        )


# Documentação e migração
def test_openapi_documenta_a_rota_de_associacao(client):
    schema = client.get("/openapi.json").json()

    operation = schema["paths"][URL]["post"]

    assert {"200", "404", "409", "429", "422"} <= set(operation["responses"])
    # Rota pública: o colaborador ainda não tem credencial
    assert not operation.get("security")


def test_migracao_adiciona_machine_name_preservando_dados(tmp_path):
    engine = create_engine(f"sqlite:///{tmp_path / 'legacy.db'}")

    with engine.begin() as conn:
        conn.execute(text("CREATE TABLE managers (id CHAR(32) PRIMARY KEY)"))
        conn.execute(text(
            "CREATE TABLE users (id CHAR(32) PRIMARY KEY, "
            "username VARCHAR(150) NOT NULL)"
        ))
        conn.execute(text("INSERT INTO users VALUES ('a', 'joao')"))

    apply_schema_upgrades(engine)
    apply_schema_upgrades(engine)  # idempotente

    assert "machine_name" in {
        c["name"] for c in inspect(engine).get_columns("users")
    }

    with engine.connect() as conn:
        row = conn.execute(text("SELECT username, machine_name FROM users"))

        assert row.one() == ("joao", None)

    engine.dispose()
