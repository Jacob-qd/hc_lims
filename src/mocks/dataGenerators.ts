// HC-LIMS Mock Data Generators

export const sampleStateMachine: Record<string, string[]> = {
  draft: ['pending_receive'], pending_receive: ['received', 'rejected'],
  received: ['pending_assign'], pending_assign: ['assigned'],
  assigned: ['testing'], testing: ['pending_review'],
  pending_review: ['reviewing', 'rejected'], reviewing: ['completed', 'rejected'],
  completed: ['archived'], archived: [], rejected: ['pending_receive'],
};

export const taskStateMachine: Record<string, string[]> = {
  unassigned: ['pending'], pending: ['testing'], testing: ['pending_review'],
  pending_review: ['completed', 'rejected'], completed: ['archived'],
  rejected: ['testing'], overdue: ['testing', 'pending_review'], archived: [],
};

export const reportStateMachine: Record<string, string[]> = {
  draft: ['pending_tech_review'], pending_tech_review: ['tech_review'],
  tech_review: ['pending_approval', 'rejected'], pending_approval: ['approval'],
  approval: ['issued', 'rejected'], issued: ['archived'], archived: [], rejected: ['draft'],
};

export function validateTransition(
  entity: string, currentStatus: string, nextStatus: string,
  stateMachine: Record<string, string[]>
): { valid: boolean; message?: string } {
  const allowed = stateMachine[currentStatus];
  if (!allowed) return { valid: false, message: `${entity} 状态 "${currentStatus}" 不存在` };
  if (!allowed.includes(nextStatus)) {
    return { valid: false, message: `${entity} 状态 '${currentStatus}' 不能转移到 '${nextStatus}'，允许的状态: ${allowed.join('、')}` };
  }
  return { valid: true };
}
