import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.services.cyclone_detection.providers.base import BaseCycloneProvider
from app.services.cyclone_detection.providers.official import OfficialProvider
from app.services.cyclone_detection.providers.ibtracs import IBTrACSProvider
from app.services.cyclone_detection.providers.demo import DemoCycloneProvider
from app.services.cyclone_detection.normalizer import normalize_cyclone_payload

logger = logging.getLogger(__name__)

class CycloneDetectionService:
    """
    Core cyclone detection engine orchestrating live and demo providers.
    Automatically checks cyclone sources, detects active cyclonic disturbances,
    and normalizes them into GIS and decision-support structures.
    """
    def __init__(self):
        self.providers: List[BaseCycloneProvider] = [
            OfficialProvider(),
            IBTrACSProvider(),
            DemoCycloneProvider()
        ]
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._active_cyclones_cache: List[Dict[str, Any]] = []

    def detect_active_cyclones(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Polls configured providers to detect active cyclones in North Indian Ocean basin.
        Falls back to DemoProvider if no live cyclones are currently active.
        """
        if self._active_cyclones_cache and not force_refresh:
            return self._active_cyclones_cache

        detected_raw: List[Dict[str, Any]] = []
        
        # In non-demo mode, probe live providers first
        if not settings.DEMO_MODE:
            for p in self.providers:
                if not isinstance(p, DemoCycloneProvider):
                    try:
                        res = p.detect_active_cyclones()
                        if res:
                            detected_raw.extend(res)
                            logger.info(f"Detected {len(res)} storms via {p.provider_name}")
                            break
                    except Exception as e:
                        logger.error(f"Error querying provider {p.provider_name}: {e}")

        # If live sources return nothing or DEMO_MODE is True, activate DemoProvider
        if not detected_raw:
            demo_provider = DemoCycloneProvider()
            detected_raw = demo_provider.detect_active_cyclones()
            logger.info("Using DemoProvider for active cyclone detection scenarios.")

        # Normalize all detected cyclones
        normalized_list = []
        for raw in detected_raw:
            norm = normalize_cyclone_payload(raw)
            cid = raw["id"]
            self._cache[cid] = norm
            normalized_list.append(norm["summary"])

        self._active_cyclones_cache = normalized_list
        return normalized_list

    def get_cyclone_detail(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        if cyclone_id not in self._cache:
            self.detect_active_cyclones()
        return self._cache.get(cyclone_id)

    def refresh(self) -> List[Dict[str, Any]]:
        return self.detect_active_cyclones(force_refresh=True)

detector_service = CycloneDetectionService()
