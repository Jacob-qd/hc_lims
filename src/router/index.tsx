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
const SampleDetailPage = lazy(() => import('../pages/SampleDetailPage').then(m => ({ default: m.SampleDetailPage })));
const TaskResultEntry = lazy(() => import('../pages/TaskResultEntry').then(m => ({ default: m.TaskResultEntry })));
const ResearchGroupPage = lazy(() => import('../pages/ResearchGroupPage').then(m => ({ default: m.ResearchGroupPage })));
const ResearchProjectPage = lazy(() => import('../pages/ResearchProjectPage').then(m => ({ default: m.ResearchProjectPage })));
const ELNPage = lazy(() => import('../pages/ELNPage').then(m => ({ default: m.ELNPage })));
const ReservationPage = lazy(() => import('../pages/ReservationPage').then(m => ({ default: m.ReservationPage })));
const InventoryPage = lazy(() => import('../pages/InventoryPage').then(m => ({ default: m.InventoryPage })));
const MethodsPage = lazy(() => import('../pages/MethodsPage').then(m => ({ default: m.MethodsPage })));
const PersonnelPage = lazy(() => import('../pages/PersonnelPage').then(m => ({ default: m.PersonnelPage })));
const TeachingPage = lazy(() => import('../pages/TeachingPage').then(m => ({ default: m.TeachingPage })));
const SafetyPage = lazy(() => import('../pages/SafetyPage').then(m => ({ default: m.SafetyPage })));
const AchievementPage = lazy(() => import('../pages/AchievementPage').then(m => ({ default: m.AchievementPage })));
const CustomerPortalPage = lazy(() => import('../pages/CustomerPortalPage').then(m => ({ default: m.CustomerPortalPage })));
const AuditLogPage = lazy(() => import('../pages/AuditLogPage').then(m => ({ default: m.AuditLogPage })));
const NotificationPage = lazy(() => import('../pages/NotificationPage').then(m => ({ default: m.NotificationPage })));
const HelpPage = lazy(() => import('../pages/HelpPage').then(m => ({ default: m.HelpPage })));
const DictPage = lazy(() => import('../pages/DictPage').then(m => ({ default: m.DictPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const COCPage = lazy(() => import('../pages/COCPage').then(m => ({ default: m.COCPage })));
const BackupPage = lazy(() => import('../pages/BackupPage').then(m => ({ default: m.BackupPage })));
const WorkflowPage = lazy(() => import('../pages/WorkflowPage').then(m => ({ default: m.WorkflowPage })));
const TaskCenterPage = lazy(() => import('../pages/TaskCenterPage').then(m => ({ default: m.TaskCenterPage })));
const ReportEnginePage = lazy(() => import('../pages/ReportEnginePage').then(m => ({ default: m.ReportEnginePage })));
const FieldConfigEditor = lazy(() => import('../pages/FieldConfigEditor').then(m => ({ default: m.FieldConfigEditor })));
const CompliancePage = lazy(() => import('../pages/CompliancePage').then(m => ({ default: m.CompliancePage })));
const MonitorPage = lazy(() => import('../pages/MonitorPage').then(m => ({ default: m.MonitorPage })));
const BatchSchedulerPage = lazy(() => import('../pages/BatchSchedulerPage').then(m => ({ default: m.BatchSchedulerPage })));
const CertificatePage = lazy(() => import('../pages/CertificatePage').then(m => ({ default: m.CertificatePage })));
const QuotationsPage = lazy(() => import('../pages/QuotationsPage').then(m => ({ default: m.QuotationsPage })));
const OrdersPage = lazy(() => import('../pages/OrdersPage').then(m => ({ default: m.OrdersPage })));
const MobilePage = lazy(() => import('../pages/MobilePage').then(m => ({ default: m.MobilePage })));
const MobileSamplingPage = lazy(() => import('../pages/MobileSamplingPage').then(m => ({ default: m.MobileSamplingPage })));
const MobileTaskListPage = lazy(() => import('../pages/MobileTaskListPage').then(m => ({ default: m.MobileTaskListPage })));
const MobileScanReceiptPage = lazy(() => import('../pages/MobileScanReceiptPage').then(m => ({ default: m.MobileScanReceiptPage })));
const MobileResultEntryPage = lazy(() => import('../pages/MobileResultEntryPage').then(m => ({ default: m.MobileResultEntryPage })));
const MobileReportViewPage = lazy(() => import('../pages/MobileReportViewPage').then(m => ({ default: m.MobileReportViewPage })));
const MobileProfilePage = lazy(() => import('../pages/MobileProfilePage').then(m => ({ default: m.MobileProfilePage })));
const AIAssistantPage = lazy(() => import('../pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const AIPredictionPage = lazy(() => import('../pages/AIPredictionPage').then(m => ({ default: m.AIPredictionPage })));

export const router = createBrowserRouter([
  {
    path: '/mobile',
    element: <RouteGuard requireAuth={false}><MobilePage /></RouteGuard>,
  },
  {
    path: '/mobile/sampling',
    element: <RouteGuard requireAuth={false}><MobileSamplingPage /></RouteGuard>,
  },
  {
    path: '/mobile/tasks',
    element: <RouteGuard requireAuth={false}><MobileTaskListPage /></RouteGuard>,
  },
  {
    path: '/mobile/scan-receipt',
    element: <RouteGuard requireAuth={false}><MobileScanReceiptPage /></RouteGuard>,
  },
  {
    path: '/mobile/result-entry',
    element: <RouteGuard requireAuth={false}><MobileResultEntryPage /></RouteGuard>,
  },
  {
    path: '/mobile/reports',
    element: <RouteGuard requireAuth={false}><MobileReportViewPage /></RouteGuard>,
  },
  {
    path: '/mobile/profile',
    element: <RouteGuard requireAuth={false}><MobileProfilePage /></RouteGuard>,
  },
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
      { path: 'quotations', element: <QuotationsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'quality', element: <QualityPage /> },
      { path: 'instruments', element: <InstrumentsPage /> },
      { path: 'statistics', element: <StatisticsPage /> },
      { path: 'query', element: <QueryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'samples/:id', element: <SampleDetailPage /> },
      { path: 'tasks/:id/result', element: <TaskResultEntry /> },
      { path: 'research/groups', element: <ResearchGroupPage /> },
      { path: 'research/projects', element: <ResearchProjectPage /> },
      { path: 'research/eln', element: <ELNPage /> },
      { path: 'research/reservations', element: <ReservationPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'methods', element: <MethodsPage /> },
      { path: 'personnel', element: <PersonnelPage /> },
      { path: 'teaching', element: <TeachingPage /> },
      { path: 'safety', element: <SafetyPage /> },
      { path: 'achievements', element: <AchievementPage /> },
      { path: 'portal', element: <CustomerPortalPage /> },
      { path: 'audit-logs', element: <AuditLogPage /> },
      { path: 'notifications', element: <NotificationPage /> },
      { path: 'help', element: <HelpPage /> },
      { path: 'dict', element: <DictPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'coc', element: <COCPage /> },
      { path: 'backup', element: <BackupPage /> },
      { path: 'workflow', element: <WorkflowPage /> },
      { path: 'workflow/tasks', element: <TaskCenterPage /> },
      { path: 'reports/engine', element: <ReportEnginePage /> },
      { path: 'settings/field-configs', element: <FieldConfigEditor /> },
      { path: 'compliance', element: <CompliancePage /> },
      { path: 'monitor', element: <MonitorPage /> },
      { path: 'scheduler', element: <BatchSchedulerPage /> },
      { path: 'certificates', element: <CertificatePage /> },
      { path: 'ai-assistant', element: <AIAssistantPage /> },
      { path: 'ai-prediction', element: <AIPredictionPage /> },
      { path: 'mobile', element: <MobilePage /> },
      { path: 'mobile/sampling', element: <MobileSamplingPage /> },
      { path: 'mobile/tasks', element: <MobileTaskListPage /> },
      { path: 'mobile/scan-receipt', element: <MobileScanReceiptPage /> },
      { path: 'mobile/result-entry', element: <MobileResultEntryPage /> },
      { path: 'mobile/reports', element: <MobileReportViewPage /> },
      { path: 'mobile/profile', element: <MobileProfilePage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
