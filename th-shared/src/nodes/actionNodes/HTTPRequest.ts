import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class HTTPRequest extends BaseActionNode {
  url: string;
  method: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'http-request';
    this.url = options.url || '';
    this.method = options.method || 'GET';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      if (!this.url) {
        throw new Error('No URL provided for HTTP request');
      }

      // Simulate HTTP request
      console.log(`Making ${this.method} request to URL: ${this.url}`);
      this.output = { result: `Simulated ${this.method} request to ${this.url}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
