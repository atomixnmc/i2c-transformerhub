import { BaseDataNode, DataNodeOptions } from "../BaseDataNode";

export class RESTAPINode extends BaseDataNode {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: any;

  constructor(id: string, alias: string, options: DataNodeOptions = {}) {
    super(id, alias);
    this.type = 'rest-api';
    this.url = options.url || '';
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body || null;
  }

  async load(): Promise<any> {
    try {
      this.status = 'running';

      if (!this.url) {
        throw new Error('URL not specified');
      }

      const response = await this.simulateAPIRequest();
      this.data = response;
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }

  private async simulateAPIRequest(): Promise<any> {
    // Simulate API request logic
    return { result: `Simulated response from ${this.url}` };
  }
}
