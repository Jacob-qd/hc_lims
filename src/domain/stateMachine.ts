// 样品/任务/报告 状态机定义

export type SampleStatus =
  | 'pending_receive'
  | 'received'
  | 'assigned'
  | 'testing'
  | 'pending_review'
  | 'completed'
  | 'archived'
  | 'discarded';

export type TaskStatus =
  | 'unassigned'
  | 'pending'
  | 'testing'
  | 'pending_review'
  | 'completed'
  | 'overdue'
  | 'rejected';

export type ReportStatus =
  | 'draft'
  | 'pending_tech_review'
  | 'tech_reviewed'
  | 'pending_approval'
  | 'issued'
  | 'archived'
  | 'recalled';

// 样品状态流转规则
export const sampleTransitions: Record<SampleStatus, SampleStatus[]> = {
  pending_receive: ['received', 'discarded'],
  received: ['assigned', 'discarded'],
  assigned: ['testing'],
  testing: ['pending_review'],
  pending_review: ['completed', 'testing'],
  completed: ['archived'],
  archived: [],
  discarded: [],
};

// 任务状态流转规则
export const taskTransitions: Record<TaskStatus, TaskStatus[]> = {
  unassigned: ['pending'],
  pending: ['testing', 'overdue'],
  testing: ['pending_review', 'overdue'],
  pending_review: ['completed', 'rejected', 'testing'],
  completed: [],
  overdue: ['testing', 'pending_review'],
  rejected: ['testing'],
};

// 报告状态流转规则
export const reportTransitions: Record<ReportStatus, ReportStatus[]> = {
  draft: ['pending_tech_review'],
  pending_tech_review: ['tech_reviewed', 'draft'],
  tech_reviewed: ['pending_approval'],
  pending_approval: ['issued', 'tech_reviewed'],
  issued: ['archived', 'recalled'],
  archived: [],
  recalled: ['draft'],
};

export function canTransition<
  T extends string,
>(current: T, next: T, transitions: Record<T, T[]>): boolean {
  return (transitions[current] || []).includes(next);
}

export function getNextStatuses<T extends string>(current: T, transitions: Record<T, T[]>): T[] {
  return transitions[current] || [];
}

export function transitionSample(current: SampleStatus, next: SampleStatus): boolean {
  return canTransition(current, next, sampleTransitions);
}

export function transitionTask(current: TaskStatus, next: TaskStatus): boolean {
  return canTransition(current, next, taskTransitions);
}

export function transitionReport(current: ReportStatus, next: ReportStatus): boolean {
  return canTransition(current, next, reportTransitions);
}

// 完整工作流：样品 → 任务 → 报告
export function runFullWorkflow(): {
  samplePath: SampleStatus[];
  taskPath: TaskStatus[];
  reportPath: ReportStatus[];
} {
  const samplePath: SampleStatus[] = [
    'pending_receive',
    'received',
    'assigned',
    'testing',
    'pending_review',
    'completed',
    'archived',
  ];

  const taskPath: TaskStatus[] = [
    'unassigned',
    'pending',
    'testing',
    'pending_review',
    'completed',
  ];

  const reportPath: ReportStatus[] = [
    'draft',
    'pending_tech_review',
    'tech_reviewed',
    'pending_approval',
    'issued',
    'archived',
  ];

  // 验证每一步是否合法
  for (let i = 0; i < samplePath.length - 1; i++) {
    if (!transitionSample(samplePath[i], samplePath[i + 1])) {
      throw new Error(`非法样品状态流转: ${samplePath[i]} → ${samplePath[i + 1]}`);
    }
  }
  for (let i = 0; i < taskPath.length - 1; i++) {
    if (!transitionTask(taskPath[i], taskPath[i + 1])) {
      throw new Error(`非法任务状态流转: ${taskPath[i]} → ${taskPath[i + 1]}`);
    }
  }
  for (let i = 0; i < reportPath.length - 1; i++) {
    if (!transitionReport(reportPath[i], reportPath[i + 1])) {
      throw new Error(`非法报告状态流转: ${reportPath[i]} → ${reportPath[i + 1]}`);
    }
  }

  return { samplePath, taskPath, reportPath };
}
