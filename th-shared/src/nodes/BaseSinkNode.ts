export abstract class BaseSinkNode {
  id: string;
  alias: string;
  type: string;
  inputs: SinkNodeInputs;
  status: string;
  error: string | null;

  constructor(id: string, alias: string) {
    this.id = id;
    this.alias = alias || id;
    this.type = 'sink';
    this.inputs = {};
    this.status = 'idle';
    this.error = null;
  }

  abstract process(inputs: SinkNodeInputs): Promise<void>;

  setInput(inputName: string, data: any): void {
    this.inputs[inputName] = data;
  }
}

export interface SinkNodeInputs {
  [key: string]: any;
}

export interface SinkNodeOptions {
  filePath?: string;
  server?: string;
  port?: number;
  username?: string;
  password?: string;
  from?: string;
  to?: string;
  subject?: string;
  isHtml?: boolean;
  attachments?: any[];
  bucketName?: string;
  accessKey?: string;
  secretKey?: string;
  region?: string;
  folderPath?: string;
  apiKey?: string;
  videoTitle?: string;
  videoDescription?: string;
  tags?: string[];
  privacy?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
  protocol?: string;
}
