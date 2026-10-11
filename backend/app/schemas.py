import uuid
from datetime import datetime
from enum import Enum

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
)

from .security import MAX_PASSWORD_BYTES

# pass = alias

class MatchFieldEnum(str, Enum):
    process = "process"
    title = "title"
    both = "both"


# Users
class UserBase(BaseModel):
    username: str
    full_name: str | None = None
    department: str | None = None


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    created_at: datetime


# Auth (gestor)
def _normalize_email(value: str) -> str:
    return value.strip().lower()


class ManagerCreate(BaseModel):
    email: EmailStr
    password: str = Field(
        min_length=8,
        max_length=MAX_PASSWORD_BYTES,
        description=f"Mínimo de 8 caracteres e máximo de {MAX_PASSWORD_BYTES} "
                    "bytes (UTF-8).",
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > MAX_PASSWORD_BYTES:
            raise ValueError(
                f"A senha deve ter no máximo {MAX_PASSWORD_BYTES} bytes."
            )
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return _normalize_email(value)


class ManagerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Validade do token, em segundos.")


# Categories
class CategoryBase(BaseModel):
    name: str
    color: str = "#6B7280"


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


# Categorization Rules
class CategorizationRuleBase(BaseModel):
    category_id: uuid.UUID
    keyword: str
    match_field: MatchFieldEnum = MatchFieldEnum.both


class CategorizationRuleCreate(CategorizationRuleBase):
    pass


class CategorizationRuleUpdate(BaseModel):
    keyword: str | None = None
    match_field: MatchFieldEnum | None = None
    category_id: uuid.UUID | None = None


class CategorizationRuleOut(CategorizationRuleBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID


# Activity Logs
class ActivityLogCreate(BaseModel):
    """
    Payload enviado pelo agente desktop a cada leitura da janela ativa
    """

    username: str = Field(..., description="Usuário do Windows capturado automaticamente (RF05)")
    hostname: str = Field(..., description="Nome da máquina (RF05)")
    process_name: str
    window_title: str | None = None
    duration_seconds: int = Field(0, ge=0)
    is_idle: bool = False
    captured_at: datetime | None = None


class ActivityLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    hostname: str
    process_name: str
    window_title: str | None
    duration_seconds: int
    category_id: uuid.UUID | None
    is_idle: bool
    captured_at: datetime


# Dashboard / Real-Time
class RealtimeEntry(BaseModel):
    username: str
    hostname: str
    process_name: str
    window_title: str | None
    category: str | None
    is_idle: bool
    seconds_since_last_activity: int
    status: str  # "online" | "ausente"


class CategorySummary(BaseModel):
    category: str
    color: str
    total_seconds: int


class UserDailySummary(BaseModel):
    username: str
    total_seconds: int
    by_category: list[CategorySummary]


class DailySummaryResponse(BaseModel):
    date: str
    users: list[UserDailySummary]


# Settings
class SystemSettingsBase(BaseModel):
    capture_interval_seconds: int = Field(10, ge=1)
    idle_timeout_seconds: int = Field(300, ge=1)


class SystemSettingsUpdate(SystemSettingsBase):
    pass


class SystemSettingsOut(SystemSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    updated_at: datetime | None = None
