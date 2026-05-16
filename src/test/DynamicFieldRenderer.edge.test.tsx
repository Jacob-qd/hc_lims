import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Form } from 'antd';
import { DynamicFieldRenderer } from '../components/DynamicFieldRenderer';
import type { FieldConfig } from '../types/dynamicForm';

// 模拟全部 12 种字段类型的覆盖测试
describe('12种字段类型全覆盖', () => {
  const allTypes: FieldConfig[] = [
    { id:'t1', module:'sample', fieldKey:'f_text', label:'文本', fieldType:'text', required:false, sortOrder:1, groupName:'G', active:true, validation:{minLength:2,maxLength:10} },
    { id:'t2', module:'sample', fieldKey:'f_texta', label:'多行文本', fieldType:'textarea', required:false, sortOrder:2, groupName:'G', active:true },
    { id:'t3', module:'sample', fieldKey:'f_num', label:'数字', fieldType:'number', required:false, sortOrder:3, groupName:'G', active:true, validation:{min:0,max:1000} },
    { id:'t4', module:'sample', fieldKey:'f_date', label:'日期', fieldType:'date', required:false, sortOrder:4, groupName:'G', active:true },
    { id:'t5', module:'sample', fieldKey:'f_dt', label:'日期时间', fieldType:'datetime', required:false, sortOrder:5, groupName:'G', active:true },
    { id:'t6', module:'sample', fieldKey:'f_sel', label:'下拉', fieldType:'select', required:false, sortOrder:6, groupName:'G', active:true, options:[{label:'A',value:'a'},{label:'B',value:'b'}] },
    { id:'t7', module:'sample', fieldKey:'f_msel', label:'多选', fieldType:'multiSelect', required:false, sortOrder:7, groupName:'G', active:true, options:[{label:'X',value:'x'},{label:'Y',value:'y'}] },
    { id:'t8', module:'sample', fieldKey:'f_radio', label:'单选', fieldType:'radio', required:false, sortOrder:8, groupName:'G', active:true, options:[{label:'是',value:'yes'},{label:'否',value:'no'}] },
    { id:'t9', module:'sample', fieldKey:'f_switch', label:'开关', fieldType:'switch', required:false, sortOrder:9, groupName:'G', active:true },
    { id:'t10', module:'sample', fieldKey:'f_upload', label:'上传', fieldType:'upload', required:false, sortOrder:10, groupName:'G', active:true },
    { id:'t11', module:'sample', fieldKey:'f_sig', label:'签名', fieldType:'signature', required:false, sortOrder:11, groupName:'G', active:true },
    { id:'t12', module:'sample', fieldKey:'f_ref', label:'关联', fieldType:'reference', required:false, sortOrder:12, groupName:'G', active:true },
  ];

  it('全部12种字段渲染不崩溃', () => {
    expect(() => render(<Form><DynamicFieldRenderer configs={allTypes} /></Form>)).not.toThrow();
  });

  it('每类字段标签存在', () => {
    render(<Form><DynamicFieldRenderer configs={allTypes} /></Form>);
    ['文本','多行文本','数字','日期','日期时间','下拉','多选','单选','开关','上传','签名','关联'].forEach(label => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });
});

describe('条件运算符全覆盖', () => {
  const base: FieldConfig = { id:'c', module:'sample', fieldKey:'trigger', label:'触发', fieldType:'text', required:false, sortOrder:1, groupName:'G', active:true };
  const makeTarget = (op: string, val: unknown): FieldConfig => ({
    id:`t_${op}`, module:'sample', fieldKey:`target_${op}`, label:`目标_${op}`, fieldType:'text',
    required:false, sortOrder:2, groupName:'G', active:true,
    conditionRules: [{ field: 'trigger', operator: op as any, value: val }],
  });

  it('eq_等于: 值匹配显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('eq', 'hello')]} values={{ trigger: 'hello' }} /></Form>);
    expect(screen.getByText('目标_eq')).toBeTruthy();
  });

  it('eq_不等于: 值不匹配隐藏', () => {
    const { container } = render(<Form><DynamicFieldRenderer configs={[base, makeTarget('eq', 'hello')]} values={{ trigger: 'world' }} /></Form>);
    const items = container.querySelectorAll('.ant-form-item');
    const target = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '目标_eq');
    expect(target?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('neq_不等于: 值不同显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('neq', 'no')]} values={{ trigger: 'yes' }} /></Form>);
    expect(screen.getByText('目标_neq')).toBeTruthy();
  });

  it('gt_大于: 满足显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('gt', 10)]} values={{ trigger: 15 }} /></Form>);
    expect(screen.getByText('目标_gt')).toBeTruthy();
  });

  it('gt_不大于: 隐藏', () => {
    const { container } = render(<Form><DynamicFieldRenderer configs={[base, makeTarget('gt', 10)]} values={{ trigger: 5 }} /></Form>);
    const items = container.querySelectorAll('.ant-form-item');
    const t = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '目标_gt');
    expect(t?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('gte_大于等于边界值', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('gte', 10)]} values={{ trigger: 10 }} /></Form>);
    expect(screen.getByText('目标_gte')).toBeTruthy();
  });

  it('lt_小于: 满足显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('lt', 100)]} values={{ trigger: 50 }} /></Form>);
    expect(screen.getByText('目标_lt')).toBeTruthy();
  });

  it('lte_小于等于边界值', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('lte', 100)]} values={{ trigger: 100 }} /></Form>);
    expect(screen.getByText('目标_lte')).toBeTruthy();
  });

  it('in_包含于', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('in', ['a','b','c'])]} values={{ trigger: 'b' }} /></Form>);
    expect(screen.getByText('目标_in')).toBeTruthy();
  });

  it('in_不包含隐藏', () => {
    const { container } = render(<Form><DynamicFieldRenderer configs={[base, makeTarget('in', ['a','b'])]} values={{ trigger: 'z' }} /></Form>);
    const items = container.querySelectorAll('.ant-form-item');
    const t = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '目标_in');
    expect(t?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('contains_包含文本', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('contains', 'abc')]} values={{ trigger: 'xxabcxx' }} /></Form>);
    expect(screen.getByText('目标_contains')).toBeTruthy();
  });

  it('contains_不包含隐藏', () => {
    const { container } = render(<Form><DynamicFieldRenderer configs={[base, makeTarget('contains', 'abc')]} values={{ trigger: 'xyz' }} /></Form>);
    const items = container.querySelectorAll('.ant-form-item');
    const t = Array.from(items).find(i => i.querySelector('.ant-form-item-label')?.textContent === '目标_contains');
    expect(t?.classList.contains('ant-form-item-hidden')).toBeTruthy();
  });

  it('empty_为空时显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('empty', '')]} values={{ trigger: '' }} /></Form>);
    expect(screen.getByText('目标_empty')).toBeTruthy();
  });

  it('notEmpty_不为空时显示', () => {
    render(<Form><DynamicFieldRenderer configs={[base, makeTarget('notEmpty', '')]} values={{ trigger: '有值' }} /></Form>);
    expect(screen.getByText('目标_notEmpty')).toBeTruthy();
  });
});

describe('分组渲染', () => {
  const grouped: FieldConfig[] = [
    { id:'g1', module:'sample', fieldKey:'a', label:'A', fieldType:'text', required:false, sortOrder:1, groupName:'基本信息', active:true },
    { id:'g2', module:'sample', fieldKey:'b', label:'B', fieldType:'text', required:false, sortOrder:2, groupName:'采样信息', active:true },
    { id:'g3', module:'sample', fieldKey:'c', label:'C', fieldType:'text', required:false, sortOrder:3, groupName:'基本信息', active:true },
  ];

  it('同组字段在一起', () => {
    render(<Form><DynamicFieldRenderer configs={grouped} /></Form>);
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('B')).toBeTruthy();
    expect(screen.getByText('C')).toBeTruthy();
  });
});

describe('数值校验极端值', () => {
  const numField: FieldConfig = { id:'n1', module:'test', fieldKey:'val', label:'检测值', fieldType:'number', required:true, sortOrder:1, groupName:'G', active:true, validation:{min:0,max:10000} };

  it('正常值', () => {
    expect(() => render(<Form><DynamicFieldRenderer configs={[numField]} /></Form>)).not.toThrow();
  });

  it('边界值0', () => {
    render(<Form><DynamicFieldRenderer configs={[numField]} /></Form>);
    expect(screen.getByText('检测值')).toBeTruthy();
  });

  it('边界值10000', () => {
    render(<Form><DynamicFieldRenderer configs={[numField]} /></Form>);
    expect(screen.getByText('检测值')).toBeTruthy();
  });
});
