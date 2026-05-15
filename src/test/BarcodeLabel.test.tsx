import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { BarcodePreview, generateSampleBarcode } from '../components/BarcodeLabel';

function renderWithProviders(ui: React.ReactNode) {
  return render(<BrowserRouter><ConfigProvider>{ui}</ConfigProvider></BrowserRouter>);
}

describe('BarcodeLabel', () => {
  it('renders barcode preview with label', () => {
    const { container } = renderWithProviders(
      <BarcodePreview code="SMP202405150001" label="样品001" />
    );
    // Should have an SVG element for the barcode
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(screen.getByText('样品001')).toBeInTheDocument();
  });

  it('renders barcode without label', () => {
    const { container } = renderWithProviders(
      <BarcodePreview code="SMP202405150002" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('generateSampleBarcode produces valid format', () => {
    const barcode = generateSampleBarcode(1);
    expect(barcode).toMatch(/^SMP\d{8}0001$/);
  });

  it('generateSampleBarcode pads index correctly', () => {
    const barcode = generateSampleBarcode(123);
    expect(barcode).toMatch(/^SMP\d{8}0123$/);
  });
});
