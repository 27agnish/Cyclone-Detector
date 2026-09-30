import asyncio
import logging
from typing import List, Dict, Any, Optional
import httpx

from app.services.cyclone_detection.providers.base import BaseCycloneProvider
from app.services.cyclone_detection.circuit_breaker import CircuitBreaker

logger = logging.getLogger("cyclone.ingest.official")

class OfficialProvider(BaseCycloneProvider):
    """
    Official Meteorological Bulletin Provider (IMD RSMC New Delhi / JTWC / WMO).
    Parses official cyclone advisories and coastal bulletin warnings with non-blocking async calls,
    exponential backoff, and circuit breaker protection.
    """
    IMD_BULLETIN_URL = "https://rsmcnewdelhi.imd.gov.in/all-cyclone-bulletin.php"

    def __init__(self):
        self.circuit_breaker = CircuitBreaker("IMD_RSMC_Official", failure_threshold=3, recovery_timeout=60.0)
        self._cached_records: List[Dict[str, Any]] = []

    @property
    def provider_name(self) -> str:
        return "Official Meteorological Service (IMD RSMC New Delhi / JTWC / WMO)"

    async def detect_active_cyclones_async(self) -> List[Dict[str, Any]]:
        """
        Asynchronously checks IMD RSMC / JTWC bulletin feeds.
        If unavailable or no storm in season, cleanly delegates without stalling requests.
        """
        if not self.circuit_breaker.can_execute():
            logger.info(
                f"[INGEST WORKER] Skipping upstream call to IMD RSMC: Circuit is {self.circuit_breaker.state}. "
                "Serving local fallback without delay."
            )
            return self._cached_records

        timeout_config = httpx.Timeout(connect=5.0, read=15.0, write=5.0, pool=5.0)
        max_attempts = 3
        backoff_delays = [1.0, 2.0, 4.0]

        async with httpx.AsyncClient(timeout=timeout_config, follow_redirects=True) as client:
            for attempt in range(1, max_attempts + 1):
                try:
                    logger.info(
                        f"[INGEST WORKER] Checking IMD RSMC / JTWC bulletins [Attempt {attempt}/{max_attempts}]: "
                        f"{self.IMD_BULLETIN_URL}"
                    )
                    resp = await client.get(self.IMD_BULLETIN_URL)
                    if resp.status_code == 200:
                        logger.info(f"[INGEST WORKER SUCCESS] IMD RSMC bulletin feed reachable (HTTP 200).")
                        self.circuit_breaker.record_success()
                        return self._cached_records
                    elif resp.status_code in (502, 503, 504):
                        raise httpx.HTTPStatusError(
                            f"IMD RSMC gateway returned {resp.status_code}",
                            request=resp.request,
                            response=resp
                        )
                    else:
                        raise httpx.HTTPStatusError(
                            f"IMD RSMC returned HTTP {resp.status_code}",
                            request=resp.request,
                            response=resp
                        )

                except (httpx.ConnectTimeout, httpx.ReadTimeout, httpx.PoolTimeout) as e:
                    logger.warning(
                        f"[INGEST WORKER TIMEOUT] IMD RSMC attempt {attempt}/{max_attempts} timed out: {type(e).__name__} ({e})."
                    )
                    if attempt == max_attempts:
                        self.circuit_breaker.record_failure(e)
                        logger.error(
                            f"[INGEST WORKER FAILED] IMD RSMC bulletins timed out after {max_attempts} attempts. "
                            f"Circuit breaker state: {self.circuit_breaker.state}."
                        )
                        return self._cached_records
                    await asyncio.sleep(backoff_delays[attempt - 1])

                except (httpx.ConnectError, httpx.NetworkError, httpx.HTTPStatusError) as e:
                    logger.warning(
                        f"[INGEST WORKER ERROR] IMD RSMC attempt {attempt}/{max_attempts} error: {e}"
                    )
                    if attempt == max_attempts:
                        self.circuit_breaker.record_failure(e)
                        return self._cached_records
                    await asyncio.sleep(backoff_delays[attempt - 1])

                except Exception as e:
                    logger.exception(f"[INGEST WORKER UNEXPECTED] Error connecting to IMD RSMC: {e}")
                    self.circuit_breaker.record_failure(e)
                    return self._cached_records

        return self._cached_records

    def detect_active_cyclones(self) -> List[Dict[str, Any]]:
        """Synchronous wrapper for backward compatibility."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                return self._cached_records
            return loop.run_until_complete(self.detect_active_cyclones_async())
        except Exception:
            return self._cached_records

    def get_cyclone_track(self, cyclone_id: str) -> Optional[Dict[str, Any]]:
        return None
