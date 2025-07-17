import asyncio
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.exc import DisconnectionError, OperationalError

from app.infrastructure.core import settings

# Создание асинхронного двигателя с улучшенными настройками
async_engine = create_async_engine(
    str(settings.ASYNC_DATABASE_URI),
    echo=False,  # Можно оставить True для отладки
    future=True,
    # Настройки пула для надежности соединений
    pool_pre_ping=True,  # Проверяет соединения перед использованием
    pool_recycle=3600,   # Пересоздает соединения каждый час
    pool_reset_on_return='rollback',  # Автоматический rollback при возврате в пул
    pool_size=10,        # Размер пула соединений
    max_overflow=20,     # Максимальное переполнение пула
)

# Создание асинхронного sessionmaker
async_session_maker = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
    autoflush=False,
)


def is_connection_error(exc: Exception) -> bool:
    """Определяет, является ли исключение ошибкой соединения с БД"""
    error_message = str(exc).lower()
    exc_type_name = type(exc).__name__
    
    if isinstance(exc, (DisconnectionError, OperationalError)):
        return True
    
    asyncpg_connection_errors = [
        'ConnectionDoesNotExistError',
        'InterfaceError', 
        'ConnectionFailureError',
        'ConnectionClosedError'
    ]
    
    if exc_type_name in asyncpg_connection_errors:
        return True
    
    connection_error_messages = [
        "connection was closed in the middle of operation",
        "connection is closed",
        "connection does not exist",
        "connection failure", 
        "server closed the connection unexpectedly",
        "connection lost",
        "connection reset",
        "connection timed out"
    ]
    
    return any(msg in error_message for msg in connection_error_messages)


class DatabaseConnectionError(Exception):
    pass


async def fastapi_get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency для получения сессии БД с автоматическим rollback при ошибках
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            try:
                await session.rollback()
                print(f"Database session rollback completed due to error: {type(e).__name__}: {e}")
            except Exception as rollback_error:
                print(f"Failed to rollback session: {rollback_error}")

            if is_connection_error(e):
                raise DatabaseConnectionError("Database connection error. Please retry your request.")
            else:
                raise e


@asynccontextmanager
async def get_db_transaction() -> AsyncGenerator[AsyncSession, None]:
    """
    Контекстный менеджер для явных транзакций с гарантированным rollback
    Используется в сервисах для множественных операций
    """
    async with async_session_maker() as session:
        try:
            async with session.begin():
                yield session
        except Exception as e:
            print(f"Transaction rolled back due to error: {type(e).__name__}: {e}")
            raise e


@asynccontextmanager 
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Простой контекстный менеджер для получения сессии БД
    Используется когда нужна обычная сессия без транзакции
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception as e:
            try:
                await session.rollback()
                print(f"Session rollback completed due to error: {type(e).__name__}: {e}")
            except Exception as rollback_error:
                print(f"Failed to rollback session: {rollback_error}")
            raise e
