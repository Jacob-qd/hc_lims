import React, { useMemo } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Switch, Radio, Checkbox, Upload, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { FormFieldSchema, FieldConfig, DynamicFields } from '../types/dynamicForm';

const { TextArea } = Input;
const { Option } = Select;

interface DynamicFieldRendererProps {
  configs: FieldConfig[] | FormFieldSchema[];
  values?: DynamicFields;
  onChange?: (values: DynamicFields) => void;
  form?: any; // AntD Form instance
  layout?: 'vertical' | 'horizontal';
  disabled?: boolean;
}

/**
 * 根据字段配置渲染 AntD Form 表单项
 */
export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  configs,
  values = {},
  onChange,
  layout = 'vertical',
  disabled = false,
}) => {
  // 将配置按 group 分组 + 排序
  const groups = useMemo(() => {
    const map: Record<string, FormFieldSchema[]> = {};
    const sorted = [...configs]
      .filter((f: any) => f.active !== false)
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    for (const f of sorted) {
      const g = (f as any).groupName || 'default';
      if (!map[g]) map[g] = [];
      map[g].push({
        key: f.fieldKey,
        label: f.label,
        type: f.fieldType,
        required: f.required,
        defaultValue: f.defaultValue,
        placeholder: f.placeholder,
        validation: (f as any).validation,
        options: (f as any).options,
        showIf: (f as any).conditionRules || (f as any).showIf,
        cascading: (f as any).cascading,
      });
    }
    return map;
  }, [configs]);

  // 条件显示评估
  const shouldShow = (field: FormFieldSchema): boolean => {
    if (!field.showIf || field.showIf.length === 0) return true;
    return field.showIf.every(rule => {
      const val = values[rule.field];
      switch (rule.operator) {
        case 'eq': return val === rule.value;
        case 'neq': return val !== rule.value;
        case 'in': return Array.isArray(rule.value) ? (rule.value as any[]).includes(val) : false;
        case 'gt': return typeof val === 'number' && typeof rule.value === 'number' && val > rule.value;
        case 'gte': return typeof val === 'number' && typeof rule.value === 'number' && val >= rule.value;
        case 'lt': return typeof val === 'number' && typeof rule.value === 'number' && val < rule.value;
        case 'lte': return typeof val === 'number' && typeof rule.value === 'number' && val <= rule.value;
        case 'contains': return String(val).includes(String(rule.value));
        case 'empty': return !val || val === '';
        case 'notEmpty': return val !== undefined && val !== '' && val !== null;
        default: return true;
      }
    });
  };

  // 根据字段类型渲染表单项
  const renderField = (field: FormFieldSchema) => {
    const rules = [];
    if (field.required) rules.push({ required: true, message: `请输入${field.label}` });
    if (field.validation) {
      if (field.validation.min !== undefined && field.type === 'number')
        rules.push({ type: 'number' as const, min: field.validation.min, message: `最小值为${field.validation.min}` });
      if (field.validation.max !== undefined && field.type === 'number')
        rules.push({ type: 'number' as const, max: field.validation.max, message: `最大值为${field.validation.max}` });
      if (field.validation.minLength)
        rules.push({ min: field.validation.minLength, message: `最少${field.validation.minLength}个字符` });
      if (field.validation.maxLength)
        rules.push({ max: field.validation.maxLength, message: `最多${field.validation.maxLength}个字符` });
      if (field.validation.pattern)
        rules.push({ pattern: new RegExp(field.validation.pattern), message: '格式不正确' });
    }

    let inputNode: React.ReactNode;

    switch (field.type) {
      case 'textarea':
        inputNode = <TextArea rows={3} placeholder={field.placeholder} disabled={disabled} maxLength={field.validation?.maxLength} />;
        break;
      case 'number':
        inputNode = <InputNumber style={{ width: '100%' }} placeholder={field.placeholder} disabled={disabled}
          min={field.validation?.min} max={field.validation?.max} />;
        break;
      case 'date':
        inputNode = <DatePicker style={{ width: '100%' }} disabled={disabled} />;
        break;
      case 'datetime':
        inputNode = <DatePicker showTime style={{ width: '100%' }} disabled={disabled} />;
        break;
      case 'select':
        inputNode = (
          <Select placeholder={field.placeholder} disabled={disabled} allowClear>
            {field.options?.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        );
        break;
      case 'multiSelect':
        inputNode = (
          <Select mode="multiple" placeholder={field.placeholder} disabled={disabled} allowClear>
            {field.options?.map(o => <Option key={o.value} value={o.value}>{o.label}</Option>)}
          </Select>
        );
        break;
      case 'radio':
        inputNode = (
          <Radio.Group disabled={disabled}>
            {field.options?.map(o => <Radio key={o.value} value={o.value}>{o.label}</Radio>)}
          </Radio.Group>
        );
        break;
      case 'switch':
        inputNode = <Switch disabled={disabled} />;
        break;
      case 'upload':
        inputNode = (
          <Upload disabled={disabled} beforeUpload={() => false}>
            <Button icon={<PlusOutlined />}>选择文件</Button>
          </Upload>
        );
        break;
      case 'signature':
        inputNode = <div style={{ border: '1px dashed #d9d9d9', borderRadius: 6, padding: 12, textAlign: 'center', color: '#999' }}>
          {disabled ? '已签名' : '点击此处进行签名'}
        </div>;
        break;
      default:
        inputNode = <Input placeholder={field.placeholder} disabled={disabled} maxLength={field.validation?.maxLength} />;
    }

    return (
      <Form.Item
        key={field.key}
        name={field.key}
        label={field.label}
        rules={rules}
        hidden={!shouldShow(field)}
      >
        {inputNode}
      </Form.Item>
    );
  };

  // 按组渲染
  const groupEntries = Object.entries(groups);
  if (groupEntries.length === 1) {
    return <>{groupEntries[0][1].map(renderField)}</>;
  }

  return (
    <>
      {groupEntries.map(([groupName, fields]) => (
        <div key={groupName} style={{ marginBottom: 16 }}>
          {groupName !== 'default' && (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid #eee' }}>
              {groupName}
            </div>
          )}
          {fields.map(renderField)}
        </div>
      ))}
    </>
  );
};

/**
 * 获取字段配置对应的初始值
 */
export function getDefaultValues(configs: FieldConfig[]): DynamicFields {
  const values: DynamicFields = {};
  for (const c of configs) {
    if (c.defaultValue !== undefined && c.defaultValue !== null) {
      values[c.fieldKey] = c.defaultValue;
    }
  }
  return values;
}

/**
 * 将字段配置转换为 Form Schema (用于生成表达式)
 */
export function configsToSchema(configs: FieldConfig[]): FormFieldSchema[] {
  return configs
    .filter(f => f.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(f => ({
      key: f.fieldKey,
      label: f.label,
      type: f.fieldType,
      required: f.required,
      defaultValue: f.defaultValue,
      placeholder: f.placeholder,
      validation: f.validation,
      options: f.options,
      showIf: f.conditionRules,
      cascading: f.cascading,
    }));
}
