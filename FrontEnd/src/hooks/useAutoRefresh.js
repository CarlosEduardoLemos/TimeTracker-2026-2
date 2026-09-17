import { useEffect } from "react";

export const DEFAULT_REFRESH_INTERVAL_MS = 30_000;

/**
 * Agenda uma atualização periódica enquanto a aba está visível.
 *
 * A pausa em segundo plano evita requisições desnecessárias. Ao retornar para
 * a aba, uma atualização imediata é solicitada antes de reiniciar o intervalo.
 */
export function useAutoRefresh(
  onRefresh,
  enabled = true,
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS,
) {
  useEffect(() => {
    if (!enabled || typeof onRefresh !== "function") return undefined;

    let timerId = null;

    const stopTimer = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const startTimer = () => {
      if (timerId === null && !document.hidden) {
        timerId = window.setInterval(onRefresh, intervalMs);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
        return;
      }

      // Revalida os dados assim que o usuário retorna à aplicação.
      onRefresh();
      startTimer();
    };

    startTimer();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMs, onRefresh]);
}
