import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RouteGuard } from '../components/RouteGuard';
import AppLayout from '../components/layout/AppLayout';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import('../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SamplesPage = lazy(() => import('../pages/SamplesPage').then(m => ({ default: m.SamplesPage })));
const TasksPage = lazy(() => import('../pages/TasksPage').then(m => ({ default: m.TasksPage })));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SchedulesPage = lazy(() => import('../pages/SchedulesPage').then(m => ({ default: m.SchedulesPage })));
const ClientsPage = lazy(() => import('../pages/ClientsPage').then(m => ({ default: m.ClientsPage })));
const ContractsPage = lazy(() => import('../pages/ContractsPage').then(m => ({ default: m.ContractsPage })));
const QualityPage = lazy(() => import('../pages/QualityPage').then(m => ({ default: m.QualityPage })));
const InstrumentsPage = lazy(() => import('../pages/InstrumentsPage').then(m => ({ default: m.InstrumentsPage })));
const StatisticsPage = lazy(() => import('../pages/StatisticsPage').then(m => ({ default: m.StatisticsPage })));
const QueryPage = lazy(() => import('../pages/QueryPage').then(m => ({ default: m.QueryPage })));
const SettingsPage = lazy(() => import('../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <RouteGuard requireAuth={false}>
        <LoginPage />
      </RouteGuard>
    ),
  },
  {
    path: '/',
    element: (
      <RouteGuard>
        <AppLayout />
      </RouteGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'samples', element: <SamplesPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'schedules', element: <SchedulesPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'contracts', element: <ContractsPage /> },
      { path: 'quality', element: <QualityPage /> },
      { path: 'instruments', element: <InstrumentsPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'query', element: <QueryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
