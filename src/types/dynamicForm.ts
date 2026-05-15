// 动态表单类型定义 —— 可被其他模块引用

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiSelect'
  | 'radio'
  | 'switch'
  | 'upload'
  | 'richText'
  | 'signature'
  | 'reference'
  | 'table';

export type ConditionOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'notIn'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'empty' | 'notEmpty';

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logic?: 'AND' | 'OR';
}

export interface CascadingRule {
  targetField: string;
  dependsOn: string;
  optionFilter: string; // expression
}

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: string;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldConfig {
  id: string;
  module: string;
  templateId?: string;
  fieldKey: string;
  label: string;
  fieldType: FieldType;
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  sortOrder: number;
  groupName?: string;
  validation?: FieldValidation;
  options?: FieldOption[];
  conditionRules?: ConditionRule[];
  cascading?: CascadingRule;
  metadata?: Record<string, unknown>;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldTemplate {
  id: string;
  name: string;
  module: string;
  description?: string;
  version: number;
  appliesTo?: {
    sampleType?: string[];
    testType?: string[];
    department?: string[];
  };
  isSnapshot: boolean;
  parentId?: string;
  fieldConfigs: FieldConfig[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ModuleType = 'sample' | 'test' | 'report' | 'instrument' | 'inventory' | 'personnel';

// 渲染 Schema (服务端生成)
export interface FormSchema {
  module: string;
  templateId?: string;
  groups: FormGroup[];
}

export interface FormGroup {
  name: string;
  fields: FormFieldSchema[];
}

export interface FormFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  validation?: FieldValidation;
  options?: FieldOption[];
  showIf?: ConditionRule[];
  cascading?: CascadingRule;
}

// 动态字段值
export type DynamicFields = Record<string, unknown>;
