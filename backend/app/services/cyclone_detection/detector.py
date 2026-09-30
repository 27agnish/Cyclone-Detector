import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.config import settings
from app.services.cyclone_detection.providers.base import BaseCycloneProvider
from app.services.cyclone_detection.providers.official import OfficialProvider
from app.services.cyclone_detection.providers.ibtracs import IBTrACSProvider
from app.services.cyclone_detection.providers.demo import DemoCycloneProvider
from app.services.cyclone_detection.normalizer import normalize_cyclone_payload

logger = logging.getLogger("cyclone.detection.service")

class CycloneDetectionService:
    """
    Core cyclone detection engine orchestrating live and demo providers.
    Uses async non-blocking execution, background caching, and circuit-breaker protection
    so incoming API requests never wait on slow or blocked upstream networks.
    """
    def __init__(self):
        self.official_provider = OfficialProvider()
        self.ibtracs_provider = IBTrACSProvider()
        self.demo_provider = DemoCycloneProvider()

        self.providers: List[BaseCycloneProvider] = [
            self.official_provider,
            self.ibtracs_provider,
            self.demo_provider
        ]
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._active_cyclones_cache: List[Dict[str, Any]] = []
        self._last_updated: Optional[datetime] = None
        self._cache_status: str = "INITIALIZING"

    @property
    def last_updated_iso(self) -> str:
        if self._last_updated:
            return self._last_updated.isoformat()
        return datetime.now(timezone.utc).isoformat()

    @property
    def cache_status(self) -> str:
        return self._cache_status

    def get_providers_health(self) -> List[Dict[str, Any]]:
        """Returns diagnostic health and circuit-breaker status across providers."""
        health = []
        if hasattr(self.official_provider, "circuit_breaker"):
            health.append(self.official_provider.circuit_breaker.get_status())
        if hasattr(self.ibtracs_provider, "circuit_breaker"):
            health.append(self.ibtracs_provider.circuit_breaker.get_status())
        health.append({
            "name": self.demo_provider.provider_name,
            "state": "STANDBY_ACTIVE" if settings.DEMO_MODE else "STANDBY",
            "failure_count": 0,
            "last_success": self.last_updated_iso,
            "last_error": None
        })
        return health

    async def detect_active_cyclones_async(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Asynchronously checks configured providers to detect active cyclones in North Indian Ocean basin.
        Reads from warm cache immediately unless force_refresh=True or cache is empty.
        Gracefully falls back to DemoProvider scenarios when no live storms are detected.
        """
        if self._active_cyclones_cache and not force_refresh:
            return self._active_cyclones_cache

        detected_raw: List[Dict[str, Any]] = []
        source_label = "DEMO_FALLBACK"

        # In non-demo mode, query live providers asynchronously with circuit breakers
        if not settings.DEMO_MODE:
            for p in [self.official_provider, self.ibtracs_provider]:
                try:
                    logger.info(f"[INGEST WORKER] Probing live provider: {p.provider_name}")
                    res = await p.detect_active_cyclones_async()
                    if res:
                        detected_raw.extend(res)
                        source_label = p.provider_name
                        logger.info(f"[INGEST WORKER] Detected {len(res)} storms via {p.provider_name}")
                        break
                except Exception as e:
                    logger.error(f"[INGEST WORKER ERROR] Failed querying provider {p.provider_name}: {e}")

        # If live sources return nothing or DEMO_MODE is True, activate high-fidelity DemoProvider
        if not detected_raw:
            detected_raw = self.demo_provider.detect_active_cyclones()
            source_label = "DemoProvider (Simulated Scenarios)"
            logger.info("[INGEST WORKER] Using DemoProvider scenarios for North Indian Ocean basin.")

        # Normalize all detected cyclones into standardized GIS schemas
        normalized_list = []
        for raw in detected_raw:
            norm = normalize_cyclone_payload(raw)
            cid = raw["id"]
            self._cache[cid] = norm
            normalized_list.append(norm["summary"])

        self._active_cyclones_cache = normalized_list
        self._last_updated = datetime.now(timezone.utc)
        self._cache_status = f"SYNCED ({source_label})"
        return normalized_list

    def detect_active_cyclones(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Synchronous entry point. If cache is populated, returns immediately.
        If cache is empty and cannot await, falls back safely to demo provider.
        """
        if self._active_cyclones_cache and not force_refresh:
            return self._active_cyclones_cache

        detected_raw = self.demo_provider.detect_active_cyclones()
        normalized_list = []
        for raw in detected_raw:
            norm = normalize_cyclone_payload(raw)
            cid = raw["id"]
            self._cache[cid] = norm
            normalized_list.append(norm["summary"])

        self._active_cyclones_cache = normalized_list
        self._last_updated = datetime.now(timezone.utc)
        self._cache_status = "WARM_CACHE"
        return normalized_list

    def get_cyclone_detail(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        if cyclone_id not in self._cache:
            self.detect_active_cyclones()
        return self._cache.get(cyclone_id)

    async def refresh_async(self) -> List[Dict[str, Any]]:
        """Asynchronous cache refresh trigger."""
        return await self.detect_active_cyclones_async(force_refresh=True)

    def refresh(self) -> List[Dict[str, Any]]:
        """Synchronous cache refresh trigger."""
        return self.detect_active_cyclones(force_refresh=True)

detector_service = CycloneDetectionService()
