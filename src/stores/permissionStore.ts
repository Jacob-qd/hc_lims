import { create } from 'zustand';

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export';
export type ModuleKey = 'sample' | 'task' | 'report' | 'quality' | 'instrument' | 'inventory' | 'method' | 'personnel' | 'client' | 'system' | 'admin';

export type Role = 'admin' | 'qa' | 'analyst' | 'instrument_manager' | 'report_reviewer';

interface PermissionState {
  userRole: Role;
  setRole: (role: Role) => void;
  hasPermission: (module: ModuleKey, action: Permission) => boolean;
  getRoleLabel: (role: Role) => string;
}

const rolePermissions: Record<Role, Partial<Record<ModuleKey, Permission[]>>> = {
  admin: { sample: ['view','create','edit','delete','approve','export'], task: ['view','create','edit','delete','approve','export'], report: ['view','create','edit','delete','approve','export'], quality: ['view','create','edit','delete','approve','export'], instrument: ['view','create','edit','delete','export'], inventory: ['view','create','edit','delete','export'], method: ['view','create','edit','delete','approve','export'], personnel: ['view','create','edit','delete','export'], client: ['view','create','edit','delete','export'], system: ['view','create','edit','delete'], admin: ['view','create','edit','delete'] },
  qa: { sample: ['view','edit','approve'], task: ['view','edit','approve'], report: ['view','edit','approve'], quality: ['view','create','edit','delete','approve','export'], instrument: ['view','export'], inventory: ['view','export'], method: ['view','edit','approve'], personnel: ['view','export'], client: ['view','export'], system: ['view'] },
  analyst: { sample: ['view','create','edit'], task: ['view','create','edit'], report: ['view','create','edit'], quality: ['view','create'], instrument: ['view'], inventory: ['view'], method: ['view'], client: ['view'], system: ['view'] },
  instrument_manager: { sample: ['view'], task: ['view'], report: ['view'], quality: ['view','create'], instrument: ['view','create','edit','delete','export'], inventory: ['view','create','edit'], method: ['view'], client: ['view'], system: ['view'] },
  report_reviewer: { sample: ['view'], task: ['view'], report: ['view','edit','approve','export'], quality: ['view','edit','approve'], instrument: ['view'], inventory: ['view'], method: ['view'], client: ['view'], system: ['view'] },
};

const roleLabels: Record<Role, string> = { admin: '系统管理员', qa: '质量主管', analyst: '检测员', instrument_manager: '仪器管理员', report_reviewer: '报告审核员' };

export const usePermissionStore = create<PermissionState>((set, get) => ({
  userRole: 'analyst' as Role,
  setRole: (role) => set({ userRole: role }),
  hasPermission: (module, action) => {
    const perms = rolePermissions[get().userRole]?.[module];
    return perms ? perms.includes(action) : false;
  },
  getRoleLabel: (role) => roleLabels[role] || role,
}));
