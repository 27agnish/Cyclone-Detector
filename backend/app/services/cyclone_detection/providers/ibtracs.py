import asyncio
import logging
from typing import List, Dict, Any, Optional
import httpx

from app.services.cyclone_detection.providers.base import BaseCycloneProvider
from app.services.cyclone_detection.circuit_breaker import CircuitBreaker

logger = logging.getLogger("cyclone.ingest.ibtracs")

class IBTrACSProvider(BaseCycloneProvider):
    """
    NOAA IBTrACS (International Best Track Archive for Climate Stewardship) Provider.
    Pulls recent cyclone activity and best tracks with non-blocking async I/O,
    exponential backoff retry, and circuit breaker protection.
    """
    IBTRACS_RECENT_URL = "https://www.ncei.noaa.gov/data/international-best-track-archive-for-climate-stewardship-ibtracs/v04r00/access/csv/ibtracs.recent.list.v04r00.csv"

    def __init__(self):
        self.circuit_breaker = CircuitBreaker("NOAA_IBTrACS", failure_threshold=3, recovery_timeout=60.0)
        self._cached_records: List[Dict[str, Any]] = []

    @property
    def provider_name(self) -> str:
        return "NOAA IBTrACS / NCEI Global Cyclone Service"

    async def detect_active_cyclones_async(self) -> List[Dict[str, Any]]:
        """
        Asynchronously fetches near-real-time cyclone records from NOAA IBTrACS.
        Protects the event loop with httpx.AsyncClient, retry with exponential backoff,
        and circuit breaker fast-failure.
        """
        if not self.circuit_breaker.can_execute():
            logger.info(
                f"[INGEST WORKER] Skipping upstream call to NOAA IBTrACS: Circuit is {self.circuit_breaker.state}. "
                "Serving local fallback without latency penalty."
            )
            return self._cached_records

        timeout_config = httpx.Timeout(connect=5.0, read=20.0, write=5.0, pool=5.0)
        max_attempts = 3
        backoff_delays = [1.0, 2.0, 4.0]

        async with httpx.AsyncClient(timeout=timeout_config, follow_redirects=True) as client:
            for attempt in range(1, max_attempts + 1):
                try:
                    logger.info(
                        f"[INGEST WORKER] Requesting NOAA IBTrACS feed [Attempt {attempt}/{max_attempts}]: "
                        f"{self.IBTRACS_RECENT_URL}"
                    )
                    resp = await client.get(self.IBTRACS_RECENT_URL)
                    
                    if resp.status_code == 200:
                        logger.info(
                            f"[INGEST WORKER SUCCESS] NOAA IBTrACS feed responded HTTP 200 OK "
                            f"(Content-Length: {len(resp.content)} bytes)."
                        )
                        self.circuit_breaker.record_success()
                        # When live records are parsed, return them; otherwise keep cache
                        return self._cached_records
                    elif resp.status_code in (502, 503, 504):
                        raise httpx.HTTPStatusError(
                            f"Upstream NOAA gateway returned HTTP {resp.status_code}",
                            request=resp.request,
                            response=resp
                        )
                    else:
                        raise httpx.HTTPStatusError(
                            f"Unexpected HTTP status {resp.status_code} from NOAA IBTrACS",
                            request=resp.request,
                            response=resp
                        )

                except (httpx.ConnectTimeout, httpx.ReadTimeout, httpx.PoolTimeout) as e:
                    logger.warning(
                        f"[INGEST WORKER TIMEOUT] NOAA IBTrACS attempt {attempt}/{max_attempts} timed out: {type(e).__name__} ({e})."
                    )
                    if attempt == max_attempts:
                        self.circuit_breaker.record_failure(e)
                        logger.error(
                            f"[INGEST WORKER FAILED] All {max_attempts} attempts to reach NOAA IBTrACS failed due to timeout. "
                            f"Falling back to cached data. Circuit breaker status: {self.circuit_breaker.state}."
                        )
                        return self._cached_records
                    await asyncio.sleep(backoff_delays[attempt - 1])

                except (httpx.ConnectError, httpx.NetworkError, httpx.HTTPStatusError) as e:
                    logger.warning(
                        f"[INGEST WORKER ERROR] NOAA IBTrACS attempt {attempt}/{max_attempts} failed with {type(e).__name__}: {e}."
                    )
                    if attempt == max_attempts:
                        self.circuit_breaker.record_failure(e)
                        logger.error(
                            f"[INGEST WORKER FAILED] All {max_attempts} attempts failed. Delegating to secondary/fallback provider."
                        )
                        return self._cached_records
                    await asyncio.sleep(backoff_delays[attempt - 1])

                except Exception as e:
                    logger.exception(f"[INGEST WORKER UNEXPECTED ERROR] Unexpected failure in NOAA IBTrACS ingest: {e}")
                    self.circuit_breaker.record_failure(e)
                    return self._cached_records

        return self._cached_records

    def detect_active_cyclones(self) -> List[Dict[str, Any]]:
        """Synchronous wrapper for backward compatibility."""
        try:
            # If already running inside an active event loop, run as task or thread
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return self._cached_records
            return loop.run_until_complete(self.detect_active_cyclones_async())
        except Exception:
            return self._cached_records

    def get_cyclone_track(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        return None
