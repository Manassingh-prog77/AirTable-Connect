// Core types for AirForm Forge

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface AirtableBase {
  id: string;
  name: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  baseId: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: 'singleLineText' | 'longText' | 'singleSelect' | 'multipleSelects' | 'multipleAttachments';
  options?: string[];
}

export interface ConditionalRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'includes' | 'notIncludes' | 'exists' | 'notExists';
  value: string;
}

export interface ConditionalLogic {
  logic: 'all' | 'any';
  rules: ConditionalRule[];
}

export interface FormQuestion {
  fieldId: string;
  fieldName: string;
  fieldType: AirtableField['type'];
  label: string;
  required: boolean;
  visibleWhen: ConditionalLogic;
  options?: string[];
}

export interface Form {
  _id: string;
  owner: string;
  title: string;
  baseId: string;
  tableId: string;
  tableName: string;
  questions: FormQuestion[];
  isPublic: boolean;
  publicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicForm {
  title: string;
  publicId: string;
  baseId: string;
  tableId: string;
  tableName: string;
  questions: FormQuestion[];
}

export interface FormSubmission {
  answers: Record<string, any>;
}

export interface UploadResponse {
  urls: string[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface BasesResponse {
  bases: AirtableBase[];
}

export interface TablesResponse {
  tables: AirtableTable[];
}

export interface FieldsResponse {
  fields: AirtableField[];
}

export interface FormsResponse {
  forms: Form[];
}