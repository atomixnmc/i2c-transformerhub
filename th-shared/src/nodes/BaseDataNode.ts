
export abstract class BaseDataNode {
  id: string;
  alias: string;
  type: string;
  data: Record<string, any> | string | null;
  status: string;
  error: string | null;

  constructor(id: string, alias: string) {
    this.id = id;
    this.alias = alias || id;
    this.type = 'data';
    this.data = {};
    this.status = 'idle';
    this.error = null;
  }

  abstract load(): Promise<any>;

  getDataByPath(path: string): any {
    if (!path) return this.data;

    const parts = path.split('.');
    let current: any = this.data;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }

    return current;
  }
}


export interface DataNodeOptions {
  filePath?: string;
  schema?: any;
  xpath?: string;
  delimiter?: string;
  hasHeader?: boolean;
  extractMetadata?: boolean;
  connectionString?: string;
  query?: string;
  parameters?: any[];
  collection?: string;
  projection?: Record<string, any>;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  formData?: Record<string, any>;
  validationRules?: Record<string, any>;
  maxItems?: number;
  server?: string;
  username?: string;
  password?: string;
  folder?: string;
  maxEmails?: number;
  markAsRead?: boolean;
  deviceId?: string;
  protocol?: string;
  topics?: string[];
  interval?: number;
}
