export type Force = 'Tham mưu' | 'An ninh' | 'Cảnh sát';

export type FieldType = 'short_text' | 'long_text' | 'number' | 'date' | 'select';

export type CustomField = {
  id: string;
  name: string;
  code: string;
  type: FieldType;
  required: boolean;
  unit?: string;
  options?: string[];
  hint?: string;
};

export type VersionStatus = 'draft' | 'active' | 'replaced';

export type TaskVersion = {
  version: number;
  status: VersionStatus;
  effectiveFrom?: string;
  effectiveTo?: string;
  basis?: string;
  baseVersion?: number;
  createdBy?: string;
  createdAt?: string;
  name: string;
  scope: string;
  output: string;
  unit: string;
  score: number;
  fields: CustomField[];
};

export type CatalogStatus = 'active' | 'inactive';

export type TaskCatalog = {
  code: string;
  force: Force;
  createdAt: string;
  status: CatalogStatus;
  versions: TaskVersion[];
};

export type CatalogColumnId =
'code' |
'name' |
'force' |
'scope' |
'output' |
'unit' |
'score' |
'group' |
'version' |
'status';