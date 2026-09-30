import time
import logging
from typing import Optional, Dict, Any, Union
from datetime import datetime, timezone

logger = logging.getLogger("cyclone.ingest.circuit_breaker")

class CircuitBreaker:
    """
    Circuit breaker to prevent cascade failures when upstream meteorological services (NOAA/JTWC/IMD)
    experience high latency or downtime.
    
    States:
      - CLOSED: Requests pass through normally.
      - OPEN: Fast-fail immediately without calling upstream; serve cached data.
      - HALF_OPEN: Probe upstream with a single trial request to verify recovery.
    """
    def __init__(self, name: str, failure_threshold: int = 3, recovery_timeout: float = 60.0):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.state = "CLOSED"
        self.failure_count = 0
        self.last_failure_time: Optional[float] = None
        self.last_success_time: Optional[datetime] = None
        self.last_error_message: Optional[str] = None

    def can_execute(self) -> bool:
        """Determines if an upstream request should be attempted or fast-failed."""
        if self.state == "CLOSED":
            return True
        
        now = time.time()
        if self.state == "OPEN":
            if self.last_failure_time and (now - self.last_failure_time) >= self.recovery_timeout:
                logger.info(f"[CIRCUIT BREAKER] {self.name} entered HALF_OPEN state. Probing upstream recovery...")
                self.state = "HALF_OPEN"
                return True
            else:
                remaining = int(self.recovery_timeout - (now - (self.last_failure_time or now)))
                logger.warning(
                    f"[CIRCUIT BREAKER] {self.name} is OPEN (fast-failing). Serving cached fallback. "
                    f"Cooldown remaining: {remaining}s. Last error: {self.last_error_message}"
                )
                return False

        # In HALF_OPEN state, allow a single trial attempt
        return True

    def record_success(self):
        """Records a successful upstream transaction and closes the circuit."""
        if self.state != "CLOSED":
            logger.info(f"[CIRCUIT BREAKER] {self.name} recovered. State transitioned from {self.state} to CLOSED.")
        self.state = "CLOSED"
        self.failure_count = 0
        self.last_error_message = None
        self.last_success_time = datetime.now(timezone.utc)

    def record_failure(self, error: Union[Exception, str]):
        """Records an upstream failure, increments counter, and opens circuit if threshold is reached."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        self.last_error_message = str(error)

        if self.failure_count >= self.failure_threshold or self.state == "HALF_OPEN":
            self.state = "OPEN"
            logger.error(
                f"[CIRCUIT BREAKER ALERT] {self.name} tripped to OPEN after {self.failure_count} consecutive failures. "
                f"Fast-failing upstream calls for {self.recovery_timeout}s. Root error: {self.last_error_message}"
            )
        else:
            logger.warning(
                f"[CIRCUIT BREAKER WARNING] {self.name} failure #{self.failure_count}/{self.failure_threshold}. "
                f"Error: {self.last_error_message}"
            )

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "last_success": self.last_success_time.isoformat() if self.last_success_time else None,
            "last_error": self.last_error_message,
            "recovery_timeout_sec": self.recovery_timeout,
        }
