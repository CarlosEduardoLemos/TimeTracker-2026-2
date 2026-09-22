import { useCallback, useEffect, useState } from "react";
import { fetchDashboardData } from "../services/api";
import { useAutoRefresh } from "./useAutoRefresh";

const INITIAL_DASHBOARD_STATE = {
  data: null,
  loading: true,
  refreshing: false,
  error: null,
  updatedAt: null,
  dataDate: null,
};

function createLoadingState(currentState, filterKey) {
  const isSameFilter = currentState.dataDate === filterKey;

  return {
    data: isSameFilter ? currentState.data : null,
    loading: !isSameFilter,
    refreshing: isSameFilter && Boolean(currentState.data),
    error: null,
    updatedAt: isSameFilter ? currentState.updatedAt : null,
    dataDate: isSameFilter ? currentState.dataDate : null,
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
 * Orquestra somente o ciclo de consulta e o estado dos dados do Dashboard.
 * O agendamento periódico e a Visibility API ficam isolados em useAutoRefresh.
 */
export function useDashboardData(selectedDate, selectedUsername = "", autoRefresh = true) {
  const [state, setState] = useState(INITIAL_DASHBOARD_STATE);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((current) => current + 1), []);

  useAutoRefresh(refresh, autoRefresh);

  useEffect(() => {
    const controller = new AbortController();
    const filterKey = `${selectedDate}:${selectedUsername}`;

    setState((currentState) => createLoadingState(currentState, filterKey));

    fetchDashboardData(selectedDate, selectedUsername, controller.signal)
      .then((dashboardData) => {
        if (controller.signal.aborted) return;

        setState({
          data: dashboardData,
          loading: false,
          refreshing: false,
          error: null,
          updatedAt: new Date(),
          dataDate: filterKey,
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
