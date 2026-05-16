import { describe, it, expect } from 'vitest';

describe('Task Auto-Split', () => {
  const splitSample = (testItems: string[]) => testItems.map((item, i) => ({
    taskNo: `TK-${String(i + 1).padStart(3, '0')}`,
    testItem: item,
    status: 'unassigned',
    statusLabel: '待分配',
    progress: 0,
  }));

  it('splits sample into correct number of tasks', () => {
    const items = ['pH值', 'COD', '氨氮', '总磷', '总氮', 'BOD₅', 'SS', 'Pb'];
    const tasks = splitSample(items);
    expect(tasks).toHaveLength(8);
    expect(tasks[0].testItem).toBe('pH值');
  });

  it('all generated tasks start as unassigned', () => {
    const tasks = splitSample(['COD', 'pH值']);
    expect(tasks.every(t => t.status === 'unassigned')).toBe(true);
  });

  it('task numbers are sequential', () => {
    const tasks = splitSample(['A', 'B', 'C']);
    expect(tasks[0].taskNo).toBe('TK-001');
    expect(tasks[2].taskNo).toBe('TK-003');
  });
});

describe('OOS Retest Flow', () => {
  const checkOOS = (result: number, standard: string): boolean => {
    const limit = parseFloat(standard.replace(/[≤<]/g, ''));
    return result > limit;
  };

  const createRetestTask = (originalTask: any) => ({
    ...originalTask,
    id: 'retest-' + originalTask.id,
    retestOf: originalTask.id,
    priority: 'urgent',
    priorityLabel: '紧急',
    retestCount: (originalTask.retestCount || 0) + 1,
    status: 'pending',
    statusLabel: '待检测',
  });

  it('detects OOS correctly', () => {
    expect(checkOOS(125, '≤50')).toBe(true);
    expect(checkOOS(25.6, '≤50')).toBe(false);
  });

  it('creates retest task with urgent priority', () => {
    const original = { id: 'tk1', testItem: 'COD', retestCount: 0 };
    const retest = createRetestTask(original);
    expect(retest.priority).toBe('urgent');
    expect(retest.retestOf).toBe('tk1');
    expect(retest.retestCount).toBe(1);
  });

  it('limits retests to 3', () => {
    const canRetest = (count: number) => count < 3;
    expect(canRetest(0)).toBe(true);
    expect(canRetest(2)).toBe(true);
    expect(canRetest(3)).toBe(false);
  });
});

describe('Batch Result Entry', () => {
  const batchResults = [
    { sample: 'SMP-001', item: 'COD', result: '25.6', judgment: '符合' },
    { sample: 'SMP-002', item: 'COD', result: '18.2', judgment: '符合' },
    { sample: 'SMP-003', item: 'COD', result: '55.1', judgment: '超标' },
  ];

  it('counts total and OOS in batch', () => {
    const total = batchResults.length;
    const oos = batchResults.filter(r => r.judgment === '超标').length;
    expect(total).toBe(3);
    expect(oos).toBe(1);
  });

  it('identifies OOS samples for retest', () => {
    const retestSamples = batchResults.filter(r => r.judgment === '超标');
    expect(retestSamples).toHaveLength(1);
    expect(retestSamples[0].sample).toBe('SMP-003');
  });

  it('validates batch completeness', () => {
    const incomplete = batchResults.filter(r => !r.result);
    expect(incomplete).toHaveLength(0);
  });
});

describe('Task Status Flow', () => {
  const validTransitions: Record<string, string[]> = {
    unassigned: ['pending'],
    pending: ['testing', 'unassigned'],
    testing: ['pending_review', 'retest_required'],
    pending_review: ['completed', 'testing'],
    retest_required: ['testing'],
    completed: [],
  };

  const canTransition = (from: string, to: string) => validTransitions[from]?.includes(to) || false;

  it('allows unassigned → pending', () => expect(canTransition('unassigned', 'pending')).toBe(true));
  it('allows testing → pending_review', () => expect(canTransition('testing', 'pending_review')).toBe(true));
  it('allows testing → retest_required', () => expect(canTransition('testing', 'retest_required')).toBe(true));
  it('rejects completed → testing', () => expect(canTransition('completed', 'testing')).toBe(false));
  it('rejects pending → completed', () => expect(canTransition('pending', 'completed')).toBe(false));
});

describe('Task Assignment Rules', () => {
  const canAssign = (analystLoad: number, maxLoad: number, isQualified: boolean) => {
    return isQualified && analystLoad < maxLoad;
  };

  it('assigns to qualified analyst with capacity', () => {
    expect(canAssign(6, 10, true)).toBe(true);
  });

  it('rejects unqualified analyst', () => {
    expect(canAssign(2, 10, false)).toBe(false);
  });

  it('rejects overloaded analyst', () => {
    expect(canAssign(10, 10, true)).toBe(false);
  });

  it('selects least loaded analyst', () => {
    const analysts = [
      { name: '张伟', load: 8, max: 10, qualified: true },
      { name: '李明', load: 4, max: 10, qualified: true },
      { name: '王明', load: 9, max: 10, qualified: true },
    ];
    const qualified = analysts.filter(a => a.qualified && a.load < a.max);
    const best = qualified.sort((a, b) => a.load - b.load)[0];
    expect(best.name).toBe('李明');
  });
});
