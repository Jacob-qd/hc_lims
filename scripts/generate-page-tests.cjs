#!/usr/bin/env node
/**
 * Generate basic render tests for all pages to boost coverage
 */
const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');
const testDir = path.join(__dirname, '../src/test');

const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

const testTemplate = (componentName, fileName) => `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ${componentName} } from '../pages/${fileName}';

describe('${componentName}', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 200, data: [], message: 'success' }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <ConfigProvider>
          <${componentName} />
        </ConfigProvider>
      </BrowserRouter>
    );
    // Wait for any async effects
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    }, { timeout: 2000 });
  });
});
`;

for (const file of pageFiles) {
  const baseName = path.basename(file, '.tsx');
  const testPath = path.join(testDir, `${baseName}.test.tsx`);

  // Skip if test already exists
  if (fs.existsSync(testPath)) {
    console.log(`SKIP (exists): ${baseName}.test.tsx`);
    continue;
  }

  // Read page file to find exported component name
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8');
  const match = content.match(/export\s+const\s+(\w+)\s*[:=]/);
  if (!match) {
    console.log(`SKIP (no export): ${file}`);
    continue;
  }

  const componentName = match[1];
  const testContent = testTemplate(componentName, baseName);
  fs.writeFileSync(testPath, testContent);
  console.log(`CREATE: ${baseName}.test.tsx`);
}

console.log('Done.');
