from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    SUPER_ADMIN_USER: str
    SUPER_ADMIN_PASS: str

    class Config:
        env_file = ".env"


settings = Settings()
