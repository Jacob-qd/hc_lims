
export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    realName: '管理员',
    role: 'admin' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    permissions: ['*'],
  },
  {
    id: '2',
    username: 'tech',
    password: 'tech123',
    realName: '技术员',
    role: 'lab_tech' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
    permissions: ['sample:view', 'sample:edit', 'task:view', 'task:edit', 'report:view'],
  },
  {
    id: '3',
    username: 'reviewer',
    password: 'reviewer123',
    realName: '审核员',
    role: 'reviewer' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=reviewer',
    permissions: ['report:view', 'report:review', 'task:view'],
  },
  {
    id: '4',
    username: 'sampler',
    password: 'sampler123',
    realName: '采样员',
    role: 'sampler' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sampler',
    permissions: ['sample:view', 'sample:edit', 'sample:create'],
  },
  {
    id: '5',
    username: 'client',
    password: 'client123',
    realName: '客户代表',
    role: 'client' as const,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=client',
    permissions: ['report:view', 'sample:view'],
  },
];

export const mockDashboardStats = {
  todaySamples: 12,
  pendingTasks: 8,
  processingTasks: 5,
  completedTasks: 156,
  pendingReports: 3,
  approvedReports: 89,
  totalClients: 24,
  monthlyRevenue: 128000,
};
