from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://financing:financing@db:5432/financing"
    
    class Config:
        env_file = ".env"


settings = Settings()
