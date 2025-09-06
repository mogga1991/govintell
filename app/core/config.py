import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "RFQ Intelligence"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "postgresql://username:password@localhost/govRFQ_navigator"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Keys
    SAM_GOV_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    RENDER_API_KEY: str = ""
    RENDER_SERVICE_ID: str = ""
    GEMINI_API_KEY: str = ""
    GOOGLE_GENERATIVE_AI_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()