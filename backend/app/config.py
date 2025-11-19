from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str

    # ElevenLabs
    elevenlabs_api_key: str

    # AWS S3
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_region: str = "us-east-1"
    aws_s3_bucket: str

    # Redis
    redis_url: str = "redis://localhost:6379"

    # Database
    database_url: str

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
