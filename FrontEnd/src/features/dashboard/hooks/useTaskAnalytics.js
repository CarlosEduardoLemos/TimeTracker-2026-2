import { useCallback, useEffect, useRef, useState } from 'react';

export function useTaskAnalytics(devApi, date, username, taskId) {
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(Boolean(devApi));
  const [tasksError, setTasksError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(Boolean(devApi));
  const [summaryError, setSummaryError] = useState(null);
  const tasksRequest = useRef(null);
  const summaryRequest = useRef(null);
  const summarySequence = useRef(0);

  const loadTasks = useCallback(async () => {
    tasksRequest.current?.abort();
    if (!devApi) {
      setTasks([]);
      setTasksLoading(false);
      setTasksError(null);
      return;
    }

    const controller = new AbortController();
    tasksRequest.current = controller;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const response = await devApi.tasks(controller.signal);
      if (!controller.signal.aborted) setTasks(response);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setTasksError(cause?.message || 'Não foi possível carregar a lista de Tasks.');
      }
    } finally {
      if (!controller.signal.aborted) setTasksLoading(false);
    }
  }, [devApi]);

  const loadSummary = useCallback(async () => {
    summaryRequest.current?.abort();
    const sequence = ++summarySequence.current;
    if (!devApi) {
      setSummary(null);
      setSummaryLoading(false);
      setSummaryError(null);
      return;
    }

    const controller = new AbortController();
    summaryRequest.current = controller;
    setSummary(null);
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await devApi.taskSummary(date, username, taskId, controller.signal);
      if (!controller.signal.aborted && sequence === summarySequence.current) setSummary(response);
    } catch (cause) {
      if (!controller.signal.aborted && sequence === summarySequence.current) {
        setSummaryError(cause?.message || 'Não foi possível carregar o resumo por Task.');
      }
    } finally {
      if (!controller.signal.aborted && sequence === summarySequence.current) {
        setSummaryLoading(false);
      }
    }
  }, [date, devApi, taskId, username]);

  useEffect(() => {
    void loadTasks();
    return () => tasksRequest.current?.abort();
  }, [loadTasks]);

  useEffect(() => {
    void loadSummary();
    return () => summaryRequest.current?.abort();
  }, [loadSummary]);

  const retry = useCallback(() => {
    void loadTasks();
    void loadSummary();
  }, [loadSummary, loadTasks]);

  return {
    tasks,
    tasksAvailable: !tasksLoading && !tasksError && Boolean(devApi),
    tasksLoading,
    tasksError,
    summary,
    summaryLoading,
    summaryError,
    retry,
    retryTasks: loadTasks,
    retrySummary: loadSummary,
  };
}
