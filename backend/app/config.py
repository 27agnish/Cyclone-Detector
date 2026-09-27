import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYCLONESHIELD AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Operational Mode & Schedule
    DEMO_MODE: bool = True
    CYCLONE_REFRESH_INTERVAL_MINUTES: int = 15
    
    # External APIs & Cloud Authentication
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-south1")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", None)
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")
    EARTH_ENGINE_PROJECT: str = os.getenv("EARTH_ENGINE_PROJECT", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cycloneshield.db")
    
    # CORS Origins (Include Vercel production frontend and local dev environments)
    CORS_ORIGINS: List[str] = [
        "https://cyclone-detector.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]
    
    # Region defaults
    DEFAULT_REGION: str = "Odisha, India"

    # Pydantic V2 Configuration
    model_config = ConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="allow"
    )

    def is_gemini_configured(self) -> bool:
        """Checks if Gemini is available via API key or Application Default Credentials."""
        has_key = bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY) > 10 and self.GEMINI_API_KEY != "YOUR_GEMINI_API_KEY")
        has_adc = bool(self.GOOGLE_APPLICATION_CREDENTIALS and os.path.exists(self.GOOGLE_APPLICATION_CREDENTIALS))
        return has_key or has_adc

    def is_earth_engine_configured(self) -> bool:
        """Checks if Earth Engine project is configured."""
        return bool(self.EARTH_ENGINE_PROJECT and self.EARTH_ENGINE_PROJECT != "YOUR_EARTH_ENGINE_PROJECT")

    def is_google_maps_configured(self) -> bool:
        """Checks if backend Google Maps server key is configured."""
        return bool(self.GOOGLE_MAPS_API_KEY and self.GOOGLE_MAPS_API_KEY != "YOUR_GOOGLE_MAPS_API_KEY")

settings = Settings()
