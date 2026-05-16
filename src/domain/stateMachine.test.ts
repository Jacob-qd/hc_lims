import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getNextStatuses,
  transitionSample,
  transitionTask,
  transitionReport,
  runFullWorkflow,
  sampleTransitions,
  taskTransitions,
  reportTransitions,
} from './stateMachine';
import type { SampleStatus, TaskStatus, ReportStatus } from './stateMachine';

describe('样品状态机', () => {
  it('待接收 → 已接收: 合法', () => {
    expect(transitionSample('pending_receive', 'received')).toBe(true);
  });

  it('待接收 → 检测中: 非法', () => {
    expect(transitionSample('pending_receive', 'testing')).toBe(false);
  });

  it('已接收 → 已分配: 合法', () => {
    expect(transitionSample('received', 'assigned')).toBe(true);
  });

  it('已分配 → 检测中: 合法', () => {
    expect(transitionSample('assigned', 'testing')).toBe(true);
  });

  it('检测中 → 待审核: 合法', () => {
    expect(transitionSample('testing', 'pending_review')).toBe(true);
  });

  it('待审核 → 已完成: 合法', () => {
    expect(transitionSample('pending_review', 'completed')).toBe(true);
  });

  it('待审核 → 检测中: 合法(退回)', () => {
    expect(transitionSample('pending_review', 'testing')).toBe(true);
  });

  it('已完成 → 已归档: 合法', () => {
    expect(transitionSample('completed', 'archived')).toBe(true);
  });

  it('已归档 → 任何状态: 非法', () => {
    expect(transitionSample('archived', 'completed')).toBe(false);
    expect(transitionSample('archived', 'testing')).toBe(false);
  });

  it('待接收 → 废弃: 合法', () => {
    expect(transitionSample('pending_receive', 'discarded')).toBe(true);
  });

  it('获取待接收的后续状态', () => {
    const next = getNextStatuses('pending_receive' as SampleStatus, sampleTransitions);
    expect(next).toContain('received');
    expect(next).toContain('discarded');
  });
});

describe('任务状态机', () => {
  it('未分配 → 待处理: 合法', () => {
    expect(transitionTask('unassigned', 'pending')).toBe(true);
  });

  it('待处理 → 检测中: 合法', () => {
    expect(transitionTask('pending', 'testing')).toBe(true);
  });

  it('待处理 → 逾期: 合法', () => {
    expect(transitionTask('pending', 'overdue')).toBe(true);
  });

  it('检测中 → 待审核: 合法', () => {
    expect(transitionTask('testing', 'pending_review')).toBe(true);
  });

  it('检测中 → 逾期: 合法', () => {
    expect(transitionTask('testing', 'overdue')).toBe(true);
  });

  it('待审核 → 已完成: 合法', () => {
    expect(transitionTask('pending_review', 'completed')).toBe(true);
  });

  it('待审核 → 驳回: 合法', () => {
    expect(transitionTask('pending_review', 'rejected')).toBe(true);
  });

  it('待审核 → 检测中: 合法(退回)', () => {
    expect(transitionTask('pending_review', 'testing')).toBe(true);
  });

  it('驳回 → 检测中: 合法', () => {
    expect(transitionTask('rejected', 'testing')).toBe(true);
  });

  it('已完成 → 任何状态: 非法', () => {
    expect(transitionTask('completed', 'testing')).toBe(false);
  });

  it('逾期 → 检测中: 合法(恢复)', () => {
    expect(transitionTask('overdue', 'testing')).toBe(true);
  });
});

describe('报告状态机', () => {
  it('草稿 → 待技术审核: 合法', () => {
    expect(transitionReport('draft', 'pending_tech_review')).toBe(true);
  });

  it('草稿 → 已签发: 非法', () => {
    expect(transitionReport('draft', 'issued')).toBe(false);
  });

  it('待技术审核 → 技术审核完成: 合法', () => {
    expect(transitionReport('pending_tech_review', 'tech_reviewed')).toBe(true);
  });

  it('待技术审核 → 草稿: 合法(退回)', () => {
    expect(transitionReport('pending_tech_review', 'draft')).toBe(true);
  });

  it('技术审核完成 → 待批准签发: 合法', () => {
    expect(transitionReport('tech_reviewed', 'pending_approval')).toBe(true);
  });

  it('待批准签发 → 已签发: 合法', () => {
    expect(transitionReport('pending_approval', 'issued')).toBe(true);
  });

  it('待批准签发 → 技术审核完成: 合法(退回)', () => {
    expect(transitionReport('pending_approval', 'tech_reviewed')).toBe(true);
  });

  it('已签发 → 已归档: 合法', () => {
    expect(transitionReport('issued', 'archived')).toBe(true);
  });

  it('已签发 → 已撤回: 合法', () => {
    expect(transitionReport('issued', 'recalled')).toBe(true);
  });

  it('已撤回 → 草稿: 合法', () => {
    expect(transitionReport('recalled', 'draft')).toBe(true);
  });

  it('已归档 → 任何状态: 非法', () => {
    expect(transitionReport('archived', 'issued')).toBe(false);
    expect(transitionReport('archived', 'draft')).toBe(false);
  });

  it('完整工作流: 创建→审核→签发→归档', () => {
    const { reportPath } = runFullWorkflow();
    expect(reportPath).toEqual([
      'draft',
      'pending_tech_review',
      'tech_reviewed',
      'pending_approval',
      'issued',
      'archived',
    ]);
  });
});

describe('完整端到端工作流', () => {
  it('样品→任务→报告全链路状态流转', () => {
    const { samplePath, taskPath, reportPath } = runFullWorkflow();

    expect(samplePath[0]).toBe('pending_receive');
    expect(samplePath[samplePath.length - 1]).toBe('archived');

    expect(taskPath[0]).toBe('unassigned');
    expect(taskPath[taskPath.length - 1]).toBe('completed');

    expect(reportPath[0]).toBe('draft');
    expect(reportPath[reportPath.length - 1]).toBe('archived');
  });

  it('非法状态流转应被拒绝', () => {
    expect(transitionSample('pending_receive', 'archived')).toBe(false);
    expect(transitionTask('unassigned', 'completed')).toBe(false);
    expect(transitionReport('draft', 'archived')).toBe(false);
  });

  it('状态回退应被允许', () => {
    expect(transitionSample('pending_review', 'testing')).toBe(true);
    expect(transitionTask('pending_review', 'testing')).toBe(true);
    expect(transitionReport('pending_approval', 'tech_reviewed')).toBe(true);
  });
});

describe('通用状态机工具', () => {
  it('canTransition泛型函数', () => {
    const transitions = { a: ['b'], b: ['c'], c: [] } as Record<string, string[]>;
    expect(canTransition('a', 'b', transitions)).toBe(true);
    expect(canTransition('a', 'c', transitions)).toBe(false);
  });

  it('getNextStatuses返回空数组当状态不存在', () => {
    const transitions = { a: ['b'] } as Record<string, string[]>;
    expect(getNextStatuses('z', transitions)).toEqual([]);
  });
});
