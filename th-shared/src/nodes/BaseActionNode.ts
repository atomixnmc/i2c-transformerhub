export abstract class BaseActionNode {
  id: string;
  alias: string;
  type: string;
  inputs: ActionNodeInputs;
  output: any;
  status: string;
  error: string | null;

  constructor(id: string, alias: string) {
    this.id = id;
    this.alias = alias || id;
    this.type = 'action';
    this.inputs = {};
    this.output = null;
    this.status = 'idle';
    this.error = null;
  }

  abstract process(inputs: ActionNodeInputs): Promise<any>;

  setInput(inputName: string, data: any): void {
    this.inputs[inputName] = data;
  }
}

export interface ActionNodeInputs {
  [key: string]: any;
}

export interface ActionNodeOptions {
  schema?: any;
  strictMode?: boolean;
  xslt?: string;
  outputFormat?: string;
  conditions?: any[];
  operator?: string;
  mappings?: Record<string, string | ((item: any) => any)>;
  defaultValues?: Record<string, any>;
  server?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  isHtml?: boolean;
  attachments?: any[];
  outputPath?: string;
  resolution?: string;
  bitrate?: string;
  preset?: string;
  credentials?: Record<string, any>;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  privacy?: string;
  operations?: any[];
  analyses?: string[];
  language?: string;
  groupBy?: string[];
  aggregations?: any[];
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  filePath?: string;
  format?: string;
  encoding?: string;
  append?: boolean;
  connectionString?: string;
  table?: string;
  operation?: string;
  keyField?: string;
  batch?: boolean;
  joinType?: string;
  leftKey?: string;
  rightKey?: string;
  resultFields?: any[];
  schedule?: string;
  timezone?: string;
  maxRuns?: number;
  rules?: Record<string, any>;
  channel?: string;
  recipients?: string[];
  template?: string;
  priority?: string;
  modelPath?: string;
  modelType?: string;
  inputFields?: string[];
  outputField?: string;
  threshold?: number;
}