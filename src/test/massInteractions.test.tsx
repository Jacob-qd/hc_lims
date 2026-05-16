import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// Import all pages for mass interaction testing
import { ReportsPage } from '../pages/ReportsPage';
import { WorkflowPage } from '../pages/WorkflowPage';
import { ReportEnginePage } from '../pages/ReportEnginePage';
import { SamplesPage } from '../pages/SamplesPage';
import { TasksPage } from '../pages/TasksPage';
// import { InstrumentsPage } from '../pages/InstrumentsPage';
import { InventoryPage } from '../pages/InventoryPage';
import { QualityPage } from '../pages/QualityPage';
import { DictPage } from '../pages/DictPage';
import { ContractsPage } from '../pages/ContractsPage';
import { BackupPage } from '../pages/BackupPage';
import { CertificatePage } from '../pages/CertificatePage';
import { ELNPage } from '../pages/ELNPage';
import { ReservationPage } from '../pages/ReservationPage';
import { ResearchGroupPage } from '../pages/ResearchGroupPage';
import { ResearchProjectPage } from '../pages/ResearchProjectPage';
import { FieldConfigEditor } from '../pages/FieldConfigEditor';
import { SchedulesPage } from '../pages/SchedulesPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotificationPage } from '../pages/NotificationPage';
import { AuditLogPage } from '../pages/AuditLogPage';
import { SafetyPage } from '../pages/SafetyPage';
import { TeachingPage } from '../pages/TeachingPage';
import { AchievementPage } from '../pages/AchievementPage';
import { CustomerPortalPage } from '../pages/CustomerPortalPage';
import { PersonnelPage } from '../pages/PersonnelPage';
import { MethodsPage } from '../pages/MethodsPage';
import { BatchSchedulerPage } from '../pages/BatchSchedulerPage';
import { MonitorPage } from '../pages/MonitorPage';
import { CompliancePage } from '../pages/CompliancePage';
import { QueryPage } from '../pages/QueryPage';
import { HelpPage } from '../pages/HelpPage';
import { ProfilePage } from '../pages/ProfilePage';
import { COCPage } from '../pages/COCPage';

function renderPage(Page: React.FC<any>, props = {}) {
  return render(
    <MemoryRouter>
      <ConfigProvider>
        <Page {...props} />
      </ConfigProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.setState({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
    token: 'test',
  });
});

async function clickAllButtonsAndInputs(container: HTMLElement, maxClicks = 20) {
  // Click all buttons
  const buttons = container.querySelectorAll('button');
  for (let i = 0; i < Math.min(buttons.length, maxClicks); i++) {
    fireEvent.click(buttons[i]);
  }
  // Click all tabs
  const tabs = container.querySelectorAll('.ant-tabs-tab');
  for (const tab of Array.from(tabs).slice(0, 5)) {
    fireEvent.click(tab);
  }
  // Fill some inputs
  const inputs = container.querySelectorAll('input');
  for (let i = 0; i < Math.min(inputs.length, 5); i++) {
    fireEvent.change(inputs[i], { target: { value: 'test' } });
  }
}

const pagesToTest = [
  { Page: ReportsPage, name: 'ReportsPage' },
  { Page: WorkflowPage, name: 'WorkflowPage' },
  { Page: ReportEnginePage, name: 'ReportEnginePage' },
  { Page: SamplesPage, name: 'SamplesPage' },
  { Page: TasksPage, name: 'TasksPage' },
  { Page: InventoryPage, name: 'InventoryPage' },
  { Page: QualityPage, name: 'QualityPage' },
  { Page: DictPage, name: 'DictPage' },
  { Page: ContractsPage, name: 'ContractsPage' },
  { Page: BackupPage, name: 'BackupPage' },
  { Page: CertificatePage, name: 'CertificatePage' },
  { Page: ELNPage, name: 'ELNPage' },
  { Page: ReservationPage, name: 'ReservationPage' },
  { Page: ResearchGroupPage, name: 'ResearchGroupPage' },
  { Page: ResearchProjectPage, name: 'ResearchProjectPage' },
  { Page: FieldConfigEditor, name: 'FieldConfigEditor' },
  { Page: SchedulesPage, name: 'SchedulesPage' },
  { Page: SettingsPage, name: 'SettingsPage' },
  { Page: NotificationPage, name: 'NotificationPage' },
  { Page: AuditLogPage, name: 'AuditLogPage' },
  { Page: SafetyPage, name: 'SafetyPage' },
  { Page: TeachingPage, name: 'TeachingPage' },
  { Page: AchievementPage, name: 'AchievementPage' },
  { Page: CustomerPortalPage, name: 'CustomerPortalPage' },
  { Page: PersonnelPage, name: 'PersonnelPage' },
  { Page: MethodsPage, name: 'MethodsPage' },
  { Page: BatchSchedulerPage, name: 'BatchSchedulerPage' },
  { Page: MonitorPage, name: 'MonitorPage' },
  { Page: CompliancePage, name: 'CompliancePage' },
  { Page: QueryPage, name: 'QueryPage' },
  { Page: COCPage, name: 'COCPage' },
  { Page: ProfilePage, name: 'ProfilePage' },
  { Page: HelpPage, name: 'HelpPage' },
];

describe('Mass page interactions', () => {
  for (const { Page, name } of pagesToTest) {
    it(`${name} - render and click buttons`, async () => {
      const { container } = renderPage(Page);
      await waitFor(() => expect(container.textContent.length).toBeGreaterThan(0), { timeout: 8000 });
      await clickAllButtonsAndInputs(container);
      expect(container.textContent.length).toBeGreaterThan(0);
    }, 15000);
  }
});
