from enum import Enum
from typing import Any

from environs import Env
from pydantic import PostgresDsn, field_validator
from pydantic_core.core_schema import FieldValidationInfo
from pydantic_settings import BaseSettings

env = Env()
env.read_env()


class ModeEnum(str, Enum):
    development = "development"
    production = "production"
    testing = "testing"


class Settings(BaseSettings):
    DATABASE_USER: str = "postgres"
    DATABASE_PASSWORD: str = "8491"
    DATABASE_HOST: str = "127.0.0.1"
    DATABASE_PORT: int = 5432
    DATABASE_NAME: str = "qr_db_test"

    ASYNC_DATABASE_URI: PostgresDsn | None = None

    @field_validator("ASYNC_DATABASE_URI", mode="after")
    def assemble_db_connection(cls, v: str | None, info: FieldValidationInfo) -> Any:
        if not v:
            return PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=info.data["DATABASE_USER"],
                password=info.data["DATABASE_PASSWORD"],
                host="localhost",  # info.data["DATABASE_HOST"],
                port=info.data["DATABASE_PORT"],
                path=f'{info.data["DATABASE_NAME"]}',
            )
        return v


settings = Settings()

print(333, settings.ASYNC_DATABASE_URI)
