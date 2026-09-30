import asyncio
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

    async def detect_active_cyclones_async(self) -> List[Dict[str, Any]]:
        """Asynchronously scans provider data sources with non-blocking I/O."""
        return await asyncio.to_thread(self.detect_active_cyclones)

    @abstractmethod
    def get_cyclone_track(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        """Returns raw observed track, forecast track, and metadata for specific cyclone."""
        pass
