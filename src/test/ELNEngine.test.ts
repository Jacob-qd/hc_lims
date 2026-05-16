import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { gb8170Round, evaluateFormula, judgeResult } from '../pages/ELNPage';

// Re-exported from ELNPage for testing
function testRound(v: number, d: number) { return gb8170Round(v, d); }
function testEval(f: string, vars: Record<string, number>) { return evaluateFormula(f, vars); }
function testJudge(v: number, s: string, r: string) { return judgeResult(v, s, r); }

describe('GB/T 8170 Rounding', () => {
  it('rounds down when remainder < 0.5', () => {
    expect(gb8170Round(25.61, 1)).toBe(25.6);
  });

  it('rounds up when remainder > 0.5', () => {
    expect(gb8170Round(25.69, 1)).toBe(25.7);
  });

  it('rounds to even when remainder = 0.5', () => {
    expect(gb8170Round(25.65, 1)).toBe(25.6); // 6 is even
    expect(gb8170Round(25.75, 1)).toBe(25.8); // 8 is even
  });

  it('handles multiple decimal places', () => {
    expect(gb8170Round(25.6543, 2)).toBe(25.65);
  });
});

describe('Formula Evaluation', () => {
  it('evaluates simple formula', () => {
    expect(evaluateFormula('(a - b) * c', { a: 0.321, b: 0.001, c: 80 })).toBeCloseTo(25.6, 1);
  });

  it('handles missing variables gracefully', () => {
    expect(evaluateFormula('a + b', { a: 1 })).toBeNaN();
  });
});

describe('Result Judgment', () => {
  it('judges lte correctly', () => {
    expect(judgeResult(25.6, '≤50', 'lte')).toBe('符合');
    expect(judgeResult(55, '≤50', 'lte')).toBe('超标');
  });

  it('judges range correctly', () => {
    expect(judgeResult(7.5, '6.0-9.0', 'range')).toBe('符合');
    expect(judgeResult(5.5, '6.0-9.0', 'range')).toBe('超标');
  });
});
