from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseCycloneProvider(ABC):
    """Abstract Base Class for Cyclone Data Providers."""
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def detect_active_cyclones(self) -> List[Dict[str, Any]]:
        """Scans provider data sources and returns list of raw active storm entities."""
        pass

    @abstractmethod
    def get_cyclone_track(self, cyclone_id: str) -> Dict[str, Any]:
        """Returns raw observed track, forecast track, and metadata for specific cyclone."""
        pass
