"""
Limite de tentativas inválidas por origem

O código de associação tem só 1.000.000 de combinações e o endpoint de
pareamento é aberto (o colaborador ainda não tem credencial), então sem um
freio ele poderia ser enumerado. O contador fica em memória do processo: com
vários workers cada um conta separado; para um limite global, troque por
Redis ou similar
"""

import threading
import time
from collections import deque

MAX_TRACKED_KEYS = 10_000


class FailedAttemptLimiter:
    def __init__(
        self,
        max_failures: int,
        window_seconds: float,
        clock=time.monotonic,
    ):
        self.max_failures = max_failures
        self.window_seconds = window_seconds
        self._clock = clock
        self._failures: dict[str, deque[float]] = {}
        self._lock = threading.Lock()

    def _prune(self, key: str, now: float) -> deque[float]:
        attempts = self._failures.get(key)

        if attempts is None:
            return deque()

        while attempts and now - attempts[0] >= self.window_seconds:
            attempts.popleft()

        if not attempts:
            del self._failures[key]

            return deque()

        return attempts

    def retry_after(self, key: str) -> int | None:
        """Segundos até poder tentar de novo, ou None se não está bloqueado"""
        with self._lock:
            now = self._clock()
            attempts = self._prune(key, now)

            if len(attempts) < self.max_failures:
                return None

            return max(1, int(self.window_seconds - (now - attempts[0])) + 1)

    def register_failure(self, key: str) -> None:
        with self._lock:
            now = self._clock()

            if key not in self._failures and (
                len(self._failures) >= MAX_TRACKED_KEYS
            ):
                for stale in list(self._failures):
                    self._prune(stale, now)

                if len(self._failures) >= MAX_TRACKED_KEYS:
                    # Memória protegida: descarta a origem mais antiga
                    self._failures.pop(next(iter(self._failures)))

            attempts = self._prune(key, now)
            attempts.append(now)
            self._failures[key] = attempts

    def reset(self) -> None:
        with self._lock:
            self._failures.clear()


association_limiter = FailedAttemptLimiter(
    max_failures=10,
    window_seconds=15 * 60,
)
