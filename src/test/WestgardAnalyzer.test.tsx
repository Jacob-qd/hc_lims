import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { WestgardAnalyzer } from '../components/WestgardAnalyzer';

const sampleData = Array.from({ length: 20 }, (_, i) => ({
  date: `2026-05-${String(i + 1).padStart(2, '0')}`,
  value: 0.5 + (Math.random() - 0.5) * 0.1,
  batch: `QC-${String(i + 1).padStart(3, '0')}`,
  analyte: '氨氮',
}));

describe('WestgardAnalyzer', () => {
  it('renders with data and shows rule analysis', () => {
    const { container } = render(
      <MemoryRouter>
        <ConfigProvider>
          <WestgardAnalyzer
            data={sampleData}
            mean={0.5}
            sd={0.025}
            analyte="氨氮"
          />
        </ConfigProvider>
      </MemoryRouter>
    );
    expect(container.textContent).toContain('控制规则分析');
  });

  it('renders rule description section', () => {
    const { container } = render(
      <MemoryRouter>
        <ConfigProvider>
          <WestgardAnalyzer
            data={sampleData.slice(0, 5)}
            mean={0.5}
            sd={0.025}
            analyte="pH值"
          />
        </ConfigProvider>
      </MemoryRouter>
    );
    expect(container.textContent).toContain('规则说明');
  });

  it('renders empty state without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <ConfigProvider>
          <WestgardAnalyzer
            data={[]}
            mean={0.5}
            sd={0.025}
            analyte="空数据"
          />
        </ConfigProvider>
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
