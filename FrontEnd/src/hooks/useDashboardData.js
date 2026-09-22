import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDashboardData } from "../services/api";
import { useAutoRefresh } from "./useAutoRefresh";

const INITIAL_DASHBOARD_STATE = {
  data: null,
  loading: true,
  refreshing: false,
  error: null,
  updatedAt: null,
  filterKey: null,
};

function createLoadingState(currentState, filterKey) {
  const isSameFilter = currentState.filterKey === filterKey;

  return {
    data: isSameFilter ? currentState.data : null,
    loading: !isSameFilter,
    refreshing: isSameFilter && Boolean(currentState.data),
    error: null,
    updatedAt: isSameFilter ? currentState.updatedAt : null,
    filterKey: isSameFilter ? currentState.filterKey : null,
  };
}

function createErrorState(currentState, error) {
  return {
    ...currentState,
    loading: false,
    refreshing: false,
    error,
  };
}

/**
 * Orquestra o ciclo de consulta e o estado dos dados do Dashboard.
 * Resumos históricos carregados com sucesso são reutilizados enquanto o filtro
 * não muda; dados atuais e lista de usuários continuam sendo reconsultados.
 */
export function useDashboardData(selectedDate, selectedUsername = "", autoRefresh = true) {
  const [state, setState] = useState(INITIAL_DASHBOARD_STATE);
  const [refreshKey, setRefreshKey] = useState(0);
  const historyCacheRef = useRef({ filterKey: null, summaries: [] });
  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);

  useAutoRefresh(refresh, autoRefresh);

  useEffect(() => {
    const controller = new AbortController();
    const filterKey = `${selectedDate}:${selectedUsername}`;
    const cachedPreviousSummaries =
      historyCacheRef.current.filterKey === filterKey
        ? historyCacheRef.current.summaries
        : [];

    setState((currentState) => createLoadingState(currentState, filterKey));

    fetchDashboardData(
      selectedDate,
      selectedUsername,
      controller.signal,
      cachedPreviousSummaries,
    )
      .then((dashboardData) => {
        if (controller.signal.aborted) return;

        historyCacheRef.current = {
          filterKey,
          summaries: dashboardData.weeklySummaries.slice(0, -1),
        };

        setState({
          data: dashboardData,
          loading: false,
          refreshing: false,
          error: null,
          updatedAt: new Date(),
          filterKey,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          setState((currentState) => createErrorState(currentState, error));
        }
      });

    return () => controller.abort();
  }, [selectedDate, selectedUsername, refreshKey]);

  return { ...state, refresh };
}
