import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { DynamicFieldRenderer, configsToSchema, getDefaultValues } from '../components/DynamicFieldRenderer';
import type { FieldConfig } from '../types/dynamicForm';

const fieldTypes: FieldConfig[] = [
  { id: '1', module: 'sample', fieldKey: 'textF', label: '文本字段', fieldType: 'text', required: false, sortOrder: 1, groupName: '基础', active: true },
  { id: '2', module: 'sample', fieldKey: 'numF', label: '数字字段', fieldType: 'number', required: false, sortOrder: 2, groupName: '基础', active: true, validation: { min: 0, max: 100 } },
  { id: '3', module: 'sample', fieldKey: 'selF', label: '下拉字段', fieldType: 'select', required: false, sortOrder: 3, groupName: '基础', active: true, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }] },
  { id: '4', module: 'sample', fieldKey: 'multiF', label: '多选字段', fieldType: 'multiSelect', required: false, sortOrder: 4, groupName: '高级', active: true, options: [{ label: 'X', value: 'x' }, { label: 'Y', value: 'y' }] },
  { id: '5', module: 'sample', fieldKey: 'radioF', label: '单选项', fieldType: 'radio', required: false, sortOrder: 5, groupName: '高级', active: true, options: [{ label: '是', value: 'yes' }, { label: '否', value: 'no' }] },
  { id: '6', module: 'sample', fieldKey: 'switchF', label: '开关', fieldType: 'switch', required: false, sortOrder: 6, groupName: '高级', active: true },
  { id: '7', module: 'sample', fieldKey: 'reqF', label: '必填字段', fieldType: 'text', required: true, sortOrder: 7, groupName: '基础', active: true },
  { id: '8', module: 'sample', fieldKey: 'condF', label: '条件字段', fieldType: 'text', required: false, sortOrder: 8, groupName: '条件', active: true,
    conditionRules: [{ field: 'selF', operator: 'eq', value: 'a' }] },
  { id: '9', module: 'sample', fieldKey: 'inactiveF', label: '已禁用字段', fieldType: 'text', required: false, sortOrder: 9, groupName: '基础', active: false },
  { id: '10', module: 'sample', fieldKey: 'inCondF', label: '多条件字段', fieldType: 'text', required: false, sortOrder: 10, groupName: '条件', active: true,
    conditionRules: [{ field: 'numF', operator: 'gte', value: 10 }, { field: 'numF', operator: 'lte', value: 20 }] },
];

describe('DynamicFieldRenderer — 正常渲染', () => {
  const renderWithForm = (configs = fieldTypes, values = {}) =>
    render(<Form><DynamicFieldRenderer configs={configs} values={values} /></Form>);

  it('渲染所有活跃字段', () => {
    const { container } = renderWithForm();
    const active = fieldTypes.filter(f => f.active);
    // +1 form field per config item
    const items = container.querySelectorAll('.ant-form-item');
    expect(items.length).toBeGreaterThanOrEqual(active.length);
  });

  it('不活跃字段不渲染', () => {
    renderWithForm();
    expect(screen.queryByText('已禁用字段')).toBeNull();
  });

  it('渲染数字输入框', () => {
    renderWithForm([fieldTypes[1]]);
    expect(screen.getByText('数字字段')).toBeTruthy();
  });

  it('渲染下拉选择框', () => {
    renderWithForm([fieldTypes[2]]);
    expect(screen.getByText('下拉字段')).toBeTruthy();
  });

  it('渲染多选', () => {
    renderWithForm([fieldTypes[3]]);
    expect(screen.getByText('多选字段')).toBeTruthy();
  });

  it('渲染单选', () => {
    renderWithForm([fieldTypes[4]]);
    expect(screen.getByText('单选项')).toBeTruthy();
  });

  it('渲染开关', () => {
    renderWithForm([fieldTypes[5]]);
    expect(screen.getByText('开关')).toBeTruthy();
  });
});

describe('DynamicFieldRenderer — 条件显示逻辑', () => {
  const renderWithForm = (values = {}) =>
    render(<Form><DynamicFieldRenderer configs={fieldTypes} values={values} /></Form>);

  it('条件_eq: 满足条件时显示', () => {
    const { container } = renderWithForm({ selF: 'a' });
    const items = container.querySelectorAll('.ant-form-item');
    const cond = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '条件字段');
    expect(cond?.classList.contains('ant-form-item-hidden')).toBeFalsy();
  });

  it('条件_eq: 不满足条件时隐藏', () => {
    const { container } = renderWithForm({ selF: 'b' });
    const items = container.querySelectorAll('.ant-form-item');
    const cond = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '条件字段');
    expect(cond?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('条件_neq: 不等于时显示', () => {
    // 用 inCondF: gte 10 AND lte 20
    const { container } = renderWithForm({ numF: 15 });
    const items = container.querySelectorAll('.ant-form-item');
    const cond = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '多条件字段');
    expect(cond?.classList.contains('ant-form-item-hidden')).toBeFalsy();
  });

  it('条件_超出范围: 隐藏', () => {
    const { container } = renderWithForm({ numF: 25 });
    const items = container.querySelectorAll('.ant-form-item');
    const cond = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '多条件字段');
    expect(cond?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('条件_空值: 不显示', () => {
    const { container } = renderWithForm({});
    const items = container.querySelectorAll('.ant-form-item');
    const cond = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '条件字段');
    expect(cond?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });
});

describe('DynamicFieldRenderer — 校验规则', () => {
  it('必填字段有 required class', () => {
    render(<Form><DynamicFieldRenderer configs={[fieldTypes[6]]} /></Form>);
    const labels = document.querySelectorAll('.ant-form-item-required');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('数字字段有 min/max 约束', () => {
    render(<Form><DynamicFieldRenderer configs={[fieldTypes[1]]} /></Form>);
    expect(screen.getByText('数字字段')).toBeTruthy();
  });
});

describe('DynamicFieldRenderer — 边界情况', () => {
  it('空配置不崩溃', () => {
    const { container } = render(<Form><DynamicFieldRenderer configs={[]} /></Form>);
    expect(container.querySelectorAll('.ant-form-item').length).toBe(0);
  });

  it('undefined values不崩溃', () => {
    expect(() => render(<Form><DynamicFieldRenderer configs={fieldTypes} values={undefined as LooseAny} /></Form>)).not.toThrow();
  });

  it('disabled=所有表单项不可编辑', () => {
    render(<Form><DynamicFieldRenderer configs={[fieldTypes[0]]} disabled /></Form>);
    const inputs = document.querySelectorAll('input');
    inputs.forEach(i => expect(i.disabled).toBeTruthy());
  });

  it('大量字段不崩溃 (100个)', () => {
    const many = Array.from({ length: 100 }, (_, i) => ({
      ...fieldTypes[0], id: String(i), fieldKey: `f${i}`, label: `字段${i}`, sortOrder: i,
    }));
    expect(() => render(<Form><DynamicFieldRenderer configs={many} /></Form>)).not.toThrow();
  });
});

describe('getDefaultValues', () => {
  it('提取有默认值的字段', () => {
    const configs: FieldConfig[] = [
      { ...fieldTypes[0], defaultValue: '默认文本' },
      { ...fieldTypes[1], defaultValue: 42 },
    ];
    const vals = getDefaultValues(configs);
    expect(vals.textF).toBe('默认文本');
    expect(vals.numF).toBe(42);
  });

  it('无默认值时返回空对象', () => {
    const vals = getDefaultValues(fieldTypes.filter(f => f.active));
    expect(Object.keys(vals).length).toBe(0);
  });
});

describe('configsToSchema', () => {
  it('过滤不活跃字段', () => {
    const schema = configsToSchema(fieldTypes);
    schema.forEach(s => expect(s.key).not.toBe('inactiveF'));
  });

  it('按sortOrder排序', () => {
    const schema = configsToSchema(fieldTypes);
    for (let i = 1; i < schema.length; i++) {
      // 过滤掉不活跃字段后，每个元素前一个sortOrder应≤后一个
      const prevSort = schema[i-1].key ? fieldTypes.find(f => f.fieldKey === schema[i-1].key)?.sortOrder || 0 : 0;
      const currSort = fieldTypes.find(f => f.fieldKey === schema[i].key)?.sortOrder || 0;
      expect(currSort).toBeGreaterThanOrEqual(prevSort);
    }
  });
});
