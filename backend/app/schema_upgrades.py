"""
Ajustes de schema para bancos já existentes

`Base.metadata.create_all` só cria tabelas que faltam, mas não adiciona colunas
novas a tabelas antigas. Enquanto o projeto não usar migrações versionadas
(Alembic), as colunas adicionadas depois da primeira versão entram aqui


Cada ajuste é idempotente e roda a cada inicialização
"""

from sqlalchemy import Uuid, inspect, text
from sqlalchemy.engine import Engine

from .utils import generate_association_code


def _add_users_manager_id(engine: Engine) -> None:
    """users.manager_id: gestor responsável pelo colaborador (equipe)"""
    inspector = inspect(engine)

    if "users" not in inspector.get_table_names():
        return

    if "manager_id" in {c["name"] for c in inspector.get_columns("users")}:
        return

    uuid_type = Uuid().compile(dialect=engine.dialect)

    with engine.begin() as conn:
        conn.execute(text(
            f"ALTER TABLE users ADD COLUMN manager_id {uuid_type} "
            "REFERENCES managers (id)"
        ))
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_users_manager_id "
            "ON users (manager_id)"
        ))


def _add_managers_association_code(engine: Engine) -> None:
    """
    managers.association_code: código de 6 dígitos da equipe. Adiciona a
    coluna, gera um código único para os gestores já existentes e só então
    cria o índice único
    """
    inspector = inspect(engine)

    if "managers" not in inspector.get_table_names():
        return

    columns = {c["name"] for c in inspector.get_columns("managers")}

    with engine.begin() as conn:
        if "association_code" not in columns:
            conn.execute(text(
                "ALTER TABLE managers ADD COLUMN association_code VARCHAR(6)"
            ))

        rows = conn.execute(text(
            "SELECT id FROM managers WHERE association_code IS NULL"
        )).fetchall()

        if rows:
            used = {
                code for (code,) in conn.execute(text(
                    "SELECT association_code FROM managers "
                    "WHERE association_code IS NOT NULL"
                ))
            }

            for (manager_id,) in rows:
                code = generate_association_code()

                while code in used:
                    code = generate_association_code()

                used.add(code)
                conn.execute(
                    text("UPDATE managers SET association_code = :code "
                         "WHERE id = :id"),
                    {"code": code, "id": manager_id},
                )

        conn.execute(text(
            "CREATE UNIQUE INDEX IF NOT EXISTS ix_managers_association_code "
            "ON managers (association_code)"
        ))


def apply_schema_upgrades(engine: Engine) -> None:
    """Chame depois de `Base.metadata.create_all`"""
    _add_users_manager_id(engine)
    _add_managers_association_code(engine)
