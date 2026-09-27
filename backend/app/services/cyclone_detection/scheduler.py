import asyncio
import logging
from app.config import settings
from app.services.cyclone_detection.detector import detector_service

logger = logging.getLogger(__name__)

class CycloneDataScheduler:
    """Periodically refreshes cyclone data in the background according to CYCLONE_REFRESH_INTERVAL_MINUTES."""

    def __init__(self):
        self._running = False
        self._task: asyncio.Task | None = None

    async def _loop(self):
        interval_secs = max(60, settings.CYCLONE_REFRESH_INTERVAL_MINUTES * 60)
        logger.info(f"Cyclone refresh scheduler started (interval: {settings.CYCLONE_REFRESH_INTERVAL_MINUTES} mins).")
        while self._running:
            try:
                await asyncio.sleep(interval_secs)
                logger.info("Scheduler triggering periodic cyclone data refresh...")
                detector_service.refresh()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in cyclone background scheduler: {e}")

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
