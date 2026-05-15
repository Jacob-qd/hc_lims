import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import React from 'react';
import { DynamicFieldRenderer } from '../components/DynamicFieldRenderer';
import type { FieldConfig } from '../types/dynamicForm';

const basicConfigs: FieldConfig[] = [
  { id: '1', module: 'sample', fieldKey: 'name', label: '样品名称', fieldType: 'text', required: true, sortOrder: 1, groupName: '基本信息', active: true },
  { id: '2', module: 'sample', fieldKey: 'type', label: '样品类型', fieldType: 'select', required: true, sortOrder: 2, groupName: '基本信息', options: [{ label: '水质', value: 'water' }, { label: '土壤', value: 'soil' }], active: true },
  { id: '3', module: 'sample', fieldKey: 'depth', label: '采样深度', fieldType: 'number', required: false, sortOrder: 3, groupName: '扩展信息', conditionRules: [{ field: 'type', operator: 'eq', value: 'water' }], active: true },
];

describe('DynamicFieldRenderer', () => {
  const renderWithForm = (configs: FieldConfig[], values = {}) => {
    return render(
      <Form>
        <DynamicFieldRenderer configs={configs} values={values} />
      </Form>
    );
  };

  it('渲染文本字段', () => {
    renderWithForm([basicConfigs[0]]);
    expect(screen.getByText('样品名称')).toBeTruthy();
  });

  it('渲染下拉选择字段', () => {
    renderWithForm([basicConfigs[1]]);
    expect(screen.getByText('样品类型')).toBeTruthy();
  });

  it('条件字段：非对应类型时隐藏', () => {
    const { container } = renderWithForm(basicConfigs, { type: 'soil' });
    const items = container.querySelectorAll('.ant-form-item');
    const depthItem = Array.from(items).find(
      item => item.querySelector('.ant-form-item-label')?.textContent === '采样深度'
    );
    expect(depthItem).toBeDefined();
    expect(depthItem?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('条件字段：对应类型时不隐藏', () => {
    const { container } = renderWithForm(basicConfigs, { type: 'water' });
    const items = container.querySelectorAll('.ant-form-item');
    const depthItem = Array.from(items).find(
      item => item.querySelector('.ant-form-item-label')?.textContent === '采样深度'
    );
    expect(depthItem?.classList.contains('ant-form-item-hidden')).toBeFalsy();
  });

  it('不活跃字段不显示', () => {
    const configs = [
      ...basicConfigs,
      { id: '4', module: 'sample', fieldKey: 'hidden', label: '隐藏字段', fieldType: 'text', required: false, sortOrder: 4, groupName: '其他', active: false },
    ];
    renderWithForm(configs);
    expect(screen.queryByText('隐藏字段')).toBeNull();
  });
});
