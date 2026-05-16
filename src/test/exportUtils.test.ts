import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportCSV, exportJSON, exportFromTable } from '../utils/export';

describe('exportCSV', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === 'a') {
        el.click = vi.fn() as any;
      }
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports data with auto headers', () => {
    const data = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }];
    exportCSV(data, 'test');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('handles empty data', () => {
    exportCSV([], 'empty');
    expect(createObjectURLSpy).not.toHaveBeenCalled();
  });

  it('handles values with commas', () => {
    const data = [{ name: 'Alice, Bob', age: 30 }];
    exportCSV(data, 'test');
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('uses custom headers', () => {
    const data = [{ name: 'Alice', age: 30 }];
    exportCSV(data, 'test', ['name']);
    expect(createObjectURLSpy).toHaveBeenCalled();
  });
});

describe('exportJSON', () => {
  it('exports json data', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    exportJSON({ key: 'value' }, 'test');
    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});

describe('exportFromTable', () => {
  it('exports from existing table', () => {
    document.body.innerHTML = '<table id="t"><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    exportFromTable('#t', 'table');
    expect(createObjectURLSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('handles missing table', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    exportFromTable('#missing', 'table');
    expect(createObjectURLSpy).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });
});
