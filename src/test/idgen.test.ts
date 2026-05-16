import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { generateId, generateOrderNo, now, today } from '../utils/idgen';

describe('idgen utilities', () => {
  it('generateId produces correct format', () => {
    const id = generateId('ORD', 1);
    expect(id).toMatch(/^ORD-\d{8}-001$/);
  });

  it('generateOrderNo pads sequence correctly', () => {
    const no = generateOrderNo(123);
    expect(no).toMatch(/^ORD-\d{8}-123$/);
  });

  it('generateOrderNo pads single digit', () => {
    const no = generateOrderNo(5);
    expect(no).toMatch(/-005$/);
  });

  it('now returns datetime format', () => {
    const n = now();
    expect(n).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('today returns date format', () => {
    const t = today();
    expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(t).toBe(new Date().toISOString().slice(0, 10));
  });
});
