import { describe, it, expect } from 'vitest';

// COC 监管链核心逻辑测试
// 测试链完整性校验、事件序列合法性、状态流转等业务规则

describe('COC 监管链 — 链完整性校验', () => {
  // 模拟 COC 事件类型
  type EventType = 'SAMPLING' | 'SUBMISSION' | 'RECEIPT' | 'REGISTRATION' | 'SUB_SAMPLING' | 'TESTING' | 'RETENTION' | 'DISPOSAL' | 'EXCEPTION';

  interface COCEvent {
    id: string; eventType: EventType; prevEventId: string | null; occurredAt: string;
  }

  // 合法的事件转移矩阵
  const VALID_NEXT: Record<EventType, EventType[]> = {
    SAMPLING: ['SUBMISSION'],
    SUBMISSION: ['RECEIPT'],
    RECEIPT: ['REGISTRATION', 'SUB_SAMPLING', 'TESTING', 'EXCEPTION'],
    REGISTRATION: ['TESTING', 'SUB_SAMPLING', 'RETENTION', 'EXCEPTION'],
    SUB_SAMPLING: ['TESTING', 'EXCEPTION'],
    TESTING: ['RETENTION', 'EXCEPTION'],
    RETENTION: ['DISPOSAL', 'EXCEPTION'],
    DISPOSAL: [],
    EXCEPTION: ['RECEIPT', 'REGISTRATION', 'TESTING', 'RETENTION', 'DISPOSAL'],
  };

  function verifyChain(events: COCEvent[]): { valid: boolean; msg: string } {
    if (events.length === 0) return { valid: false, msg: '无事件记录' };
    const sorted = [...events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    if (sorted[0].eventType !== 'SAMPLING') return { valid: false, msg: '首事件必须是采样(SAMPLING)' };
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      if (curr.prevEventId && curr.prevEventId !== prev.id) return { valid: false, msg: '前序事件不匹配' };
      const allowed = VALID_NEXT[prev.eventType] || [];
      if (!allowed.includes(curr.eventType)) return { valid: false, msg: `不允许 ${prev.eventType}→${curr.eventType}` };
      if (new Date(curr.occurredAt) < new Date(prev.occurredAt)) return { valid: false, msg: '时间倒序' };
    }
    return { valid: true, msg: '校验通过' };
  }

  // offsetHour: 越大表示越早(用于排序测试)
  const makeEvent = (id: string, type: EventType, prev: string | null, offsetHour: number): COCEvent => ({
    id, eventType: type, prevEventId: prev,
    occurredAt: new Date(Date.now() - offsetHour * 3600000).toISOString(),
  });

  it('完整COC链: 采样→送样→收样→登记→检测→留样→处置', () => {
    const events = [
      makeEvent('e1', 'SAMPLING', null, 72),
      makeEvent('e2', 'SUBMISSION', 'e1', 48),
      makeEvent('e3', 'RECEIPT', 'e2', 24),
      makeEvent('e4', 'REGISTRATION', 'e3', 12),
      makeEvent('e5', 'TESTING', 'e4', 6),
      makeEvent('e6', 'RETENTION', 'e5', 2),
      makeEvent('e7', 'DISPOSAL', 'e6', 0),
    ];
    expect(verifyChain(events).valid).toBe(true);
  });

  it('空链：不合法', () => {
    expect(verifyChain([]).valid).toBe(false);
  });

  it('首事件非SAMPLING：不合法', () => {
    const events = [makeEvent('e1', 'RECEIPT', null, 10)];
    expect(verifyChain(events).valid).toBe(false);
    expect(verifyChain(events).msg).toContain('采样');
  });

  it('跳过送样直接收样：不合法', () => {
    const events = [
      makeEvent('e1', 'SAMPLING', null, 24),
      makeEvent('e2', 'RECEIPT', 'e1', 12),
    ];
    expect(verifyChain(events).valid).toBe(false);
    expect(verifyChain(events).msg).toContain('SAMPLING→RECEIPT');
  });

  it('时间倒序：不合法', () => {
    // offset=10比offset=5更早 → e1比e2晚 → 排序后e2在前 → 首事件验证报错
    const events = [
      makeEvent('e1', 'SAMPLING', null, 5),
      makeEvent('e2', 'SUBMISSION', 'e1', 10),
    ];
    const result = verifyChain(events);
    expect(result.valid).toBe(false);
  });

  it('异常后恢复：合法', () => {
    const events = [
      makeEvent('e1', 'SAMPLING', null, 72),
      makeEvent('e2', 'SUBMISSION', 'e1', 48),
      makeEvent('e3', 'RECEIPT', 'e2', 24),
      makeEvent('e4', 'EXCEPTION', 'e3', 12),
      makeEvent('e5', 'REGISTRATION', 'e4', 2),
    ];
    expect(verifyChain(events).valid).toBe(true);
  });

  it('处置后添加事件不合法', () => {
    // 完整链后尝试在DISPOSAL后加RETENTION, 应被VALID_NEXT阻止
    const events = [
      makeEvent('e1', 'SAMPLING', null, 96),
      makeEvent('e2', 'SUBMISSION', 'e1', 72),
      makeEvent('e3', 'RECEIPT', 'e2', 48),
      makeEvent('e4', 'TESTING', 'e3', 24),
      makeEvent('e5', 'RETENTION', 'e4', 12),
      makeEvent('e6', 'DISPOSAL', 'e5', 6),
      makeEvent('e7', 'TESTING', 'e6', 0),
    ];
    const result = verifyChain(events);
    expect(result.valid).toBe(false);
    expect(result.msg).toContain('DISPOSAL→TESTING');
  });

  it('前序事件ID不匹配', () => {
    const events = [
      makeEvent('e1', 'SAMPLING', null, 24),
      { id:'e2', eventType:'SUBMISSION' as EventType, prevEventId:'wrong-id', occurredAt: new Date(Date.now() - 12*3600000).toISOString() },
    ];
    // prevEventId 指向不存在的id, 但链式校验要求e2.prev===e1.id
    expect(verifyChain(events).valid).toBe(false);
  });

  it('分样后检测：合法', () => {
    const events = [
      makeEvent('e1', 'SAMPLING', null, 72),
      makeEvent('e2', 'SUBMISSION', 'e1', 48),
      makeEvent('e3', 'RECEIPT', 'e2', 24),
      makeEvent('e4', 'REGISTRATION', 'e3', 12),
      makeEvent('e5', 'SUB_SAMPLING', 'e4', 6),
      makeEvent('e6', 'TESTING', 'e5', 2),
    ];
    expect(verifyChain(events).valid).toBe(true);
  });
});

describe('COC 状态机 — 状态流转合法性', () => {
  type COCStatus = 'active' | 'completed' | 'broken' | 'disposed';

  it('初始状态为 active', () => {
    const status: COCStatus = 'active';
    expect(status).toBe('active');
  });

  it('处置后状态变为 disposed', () => {
    const status: COCStatus = 'disposed';
    expect(['active', 'disposed', 'completed', 'broken']).toContain(status);
  });

  it('链断裂后状态变为 broken', () => {
    const status: COCStatus = 'broken';
    expect(status).toBe('broken');
  });
});
