import { useEffect, useRef, useState } from 'react';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { PageHeader } from '../../../shared/components/PageHeader';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useTasks } from '../hooks/useTasks';

export function TasksPage({ devApi = null }) {
  const mockMode = import.meta.env.DEV && !!devApi;
  const service = mockMode ? devApi : null;
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const {
    tasks,
    collaborators,
    loading,
    collaboratorsLoading,
    error,
    collaboratorsError,
    mutation,
    mutationBusy,
    mutationError,
    mutationSuccess,
    load,
    retryCollaborators,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(service);
  const editingTask = tasks.find((task) => task.id === editingTaskId) || null;
  const editTrigger = useRef(null);

  useEffect(() => {
    if (loading || error) return;
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId('');
    }
    if (editingTaskId && !tasks.some((task) => task.id === editingTaskId)) {
      setEditingTaskId(null);
    }
  }, [editingTaskId, error, loading, selectedTaskId, tasks]);

  async function saveTask(payload) {
    const saved = editingTask
      ? await updateTask(editingTask.id, payload)
      : await createTask(payload);
    if (saved) {
      const wasEditing = Boolean(editingTask);
      setEditingTaskId(null);
      if (wasEditing) {
        requestAnimationFrame(() => {
          if (editTrigger.current?.isConnected) editTrigger.current.focus();
        });
      }
    }
    return saved;
  }

  async function removeTask(task) {
    const removed = await deleteTask(task.id);
    if (removed) {
      if (selectedTaskId === task.id) setSelectedTaskId('');
      if (editingTaskId === task.id) setEditingTaskId(null);
    }
    return removed;
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Organize as atividades da equipe e consulte as atribuições."
      />
      {mockMode ? (
        <IntegrationNotice title="Demonstração isolada de desenvolvimento">
          Estas operações alteram somente dados em memória fornecidos pelos mocks. Elas não criam
          Tasks no Backend, não atribuem trabalho real e não iniciam nem controlam o monitoramento
          pelo Agent.
        </IntegrationNotice>
      ) : (
        <IntegrationNotice title="Gestão de Tasks indisponível">
          O Backend ainda não publica o CRUD de Tasks nem a associação autenticada de colaboradores.
          O formulário abaixo é uma prévia desativada; nenhuma chamada ou gravação será feita. A
          integração depende das issues #133 e #137.
        </IntegrationNotice>
      )}

      {mutationSuccess && (
        <p
          className="my-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          role="status"
        >
          {mutationSuccess}
        </p>
      )}

      <TaskForm
        key={editingTask?.id || 'new-task'}
        task={editingTask}
        collaborators={collaborators}
        collaboratorsLoading={collaboratorsLoading}
        collaboratorsError={collaboratorsError}
        onRetryCollaborators={retryCollaborators}
        onSubmit={saveTask}
        onCancel={() => {
          setEditingTaskId(null);
          requestAnimationFrame(() => {
            if (editTrigger.current?.isConnected) editTrigger.current.focus();
          });
        }}
        saving={mutationBusy}
        disabled={!mockMode}
        error={mutationError}
      />

      {mockMode && collaboratorsError && !mutationError && (
        <p className="sr-only" role="status">
          Não foi possível carregar a lista demonstrativa de colaboradores.
        </p>
      )}

      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onRetry={load}
        selectedTaskId={selectedTaskId}
        onSelectTask={setSelectedTaskId}
        onEditTask={(task, event) => {
          editTrigger.current = event.currentTarget;
          setEditingTaskId(task.id);
        }}
        onDeleteTask={removeTask}
        mutationBusy={mutationBusy}
        disabled={!mockMode}
      />
      {mockMode && mutation && (
        <p className="sr-only" role="status">
          {mutation === 'delete' ? 'Excluindo Task…' : 'Salvando Task…'}
        </p>
      )}
    </>
  );
}
