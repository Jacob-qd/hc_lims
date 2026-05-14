import { describe, it, expect } from 'vitest';
import { usePermissionStore } from '../stores/permissionStore';

describe('PermissionStore', () => {
  it('检测员可以查看样品', () => {
    usePermissionStore.getState().setRole('analyst');
    expect(usePermissionStore.getState().hasPermission('sample', 'view')).toBe(true);
  });

  it('检测员不能删除样品', () => {
    usePermissionStore.getState().setRole('analyst');
    expect(usePermissionStore.getState().hasPermission('sample', 'delete')).toBe(false);
  });

  it('检测员不能审批报告', () => {
    usePermissionStore.getState().setRole('analyst');
    expect(usePermissionStore.getState().hasPermission('report', 'approve')).toBe(false);
  });

  it('管理员拥有主要权限', () => {
    usePermissionStore.getState().setRole('admin');
    expect(usePermissionStore.getState().hasPermission('sample', 'view')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('sample', 'delete')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('report', 'approve')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('system', 'edit')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('quality', 'export')).toBe(true);
    expect(usePermissionStore.getState().hasPermission('instrument', 'create')).toBe(true);
  });

  it('质量主管可以审批质量模块', () => {
    usePermissionStore.getState().setRole('qa');
    expect(usePermissionStore.getState().hasPermission('quality', 'approve')).toBe(true);
  });

  it('报告审核员不能创建样品', () => {
    usePermissionStore.getState().setRole('report_reviewer');
    expect(usePermissionStore.getState().hasPermission('sample', 'create')).toBe(false);
  });

  it('角色标签返回正确', () => {
    expect(usePermissionStore.getState().getRoleLabel('admin')).toBe('系统管理员');
    expect(usePermissionStore.getState().getRoleLabel('qa')).toBe('质量主管');
  });
});
