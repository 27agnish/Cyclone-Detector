import asyncio
import logging
from app.config import settings
from app.services.cyclone_detection.detector import detector_service

logger = logging.getLogger("cyclone.ingest.scheduler")

class CycloneDataScheduler:
    """
    Background worker that periodically ingests and refreshes cyclone data
    and updates warm cache so incoming HTTP requests never wait on upstream NOAA/JTWC/IMD services.
    """

    def __init__(self):
        self._running = False
        self._task: asyncio.Task | None = None

    async def _loop(self):
        interval_secs = max(30, settings.CYCLONE_REFRESH_INTERVAL_MINUTES * 60)
        logger.info(f"[INGEST WORKER] Background ingest scheduler started (Interval: {interval_secs}s).")
        while self._running:
            try:
                await asyncio.sleep(interval_secs)
                logger.info("[INGEST WORKER] Scheduler triggering non-blocking background cyclone data sync...")
                await detector_service.refresh_async()
                logger.info(f"[INGEST WORKER] Background cyclone data sync complete. Cache updated at {detector_service.last_updated_iso}.")
            except asyncio.CancelledError:
                logger.info("[INGEST WORKER] Background scheduler stopped cleanly.")
                break
            except Exception as e:
                logger.exception(f"[INGEST WORKER ERROR] Error in periodic cyclone background worker: {e}")

    def start(self):
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._loop())

    def stop(self):
        if self._running:
            self._running = False
            if self._task:
                self._task.cancel()

cyclone_scheduler = CycloneDataScheduler()
