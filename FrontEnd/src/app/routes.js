import { lazy } from 'react';

export const routes = {
  painel: {
    label: 'Painel',
    title: 'Painel',
    menu: true,
    component: lazy(() =>
      import('../features/dashboard/pages/DashboardPage').then((module) => ({
        default: module.DashboardPage,
      })),
    ),
  },
  colaboradores: {
    label: 'Colaboradores',
    title: 'Colaboradores',
    menu: true,
    component: lazy(() =>
      import('../features/collaborators/pages/CollaboratorsPage').then((module) => ({
        default: module.CollaboratorsPage,
      })),
    ),
  },
  tasks: {
    label: 'Tasks',
    title: 'Tasks',
    menu: true,
    component: lazy(() =>
      import('../features/tasks/pages/TasksPage').then((module) => ({ default: module.TasksPage })),
    ),
  },
  relatorios: {
    label: 'Relatórios',
    title: 'Relatórios',
    menu: true,
    component: lazy(() =>
      import('../features/reports/pages/ReportsPage').then((module) => ({
        default: module.ReportsPage,
      })),
    ),
  },
  configuracoes: {
    label: 'Configurações',
    title: 'Configurações',
    menu: true,
    component: lazy(() =>
      import('../features/settings/pages/SettingsPage').then((module) => ({
        default: module.SettingsPage,
      })),
    ),
  },
  login: {
    label: 'Entrar',
    title: 'Entrar',
    auth: true,
    component: lazy(() =>
      import('../features/auth/pages/AuthPage').then((module) => ({ default: module.AuthPage })),
    ),
  },
  cadastro: {
    label: 'Criar conta',
    title: 'Criar conta',
    auth: true,
    component: lazy(() =>
      import('../features/auth/pages/AuthPage').then((module) => ({ default: module.AuthPage })),
    ),
  },
};

export const menuRoutes = Object.entries(routes).filter(([, config]) => config.menu);
