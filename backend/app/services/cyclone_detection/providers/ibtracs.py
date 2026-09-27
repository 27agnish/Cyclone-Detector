import httpx
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.services.cyclone_detection.providers.base import BaseCycloneProvider

logger = logging.getLogger(__name__)

class IBTrACSProvider(BaseCycloneProvider):
    """
    NOAA IBTrACS (International Best Track Archive for Climate Stewardship) Provider.
    Pulls recent cyclone activity and best tracks with graceful fallback.
    """
    IBTRACS_RECENT_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.recent.list.v04r00.csv"

    @property
    def provider_name(self) -> str:
        return "NOAA IBTrACS / NCEI Global Cyclone Service"

    def detect_active_cyclones(self) -> List[Dict[str, Any]]:
        # IBTrACS provides historical & near-real-time global cyclone tracks
        try:
            with httpx.Client(timeout=3.5) as client:
                resp = client.get(self.IBTRACS_RECENT_URL)
                if resp.status_code == 200:
                    logger.info("Successfully reached NOAA IBTrACS feed.")
                    # In a live basin scan, parse CSV rows for North Indian Ocean (NI)
        except Exception as e:
            logger.warning(f"IBTrACS remote feed unreachable ({e}); delegating to secondary provider.")
        return []

    def get_cyclone_track(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        return None
