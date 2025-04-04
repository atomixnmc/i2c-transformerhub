import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class FileWriter extends BaseActionNode {
  filePath: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'file-writer';
    this.filePath = options.filePath || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const data = inputs.data;
      if (!data) {
        throw new Error('No data provided for writing to file');
      }

      if (!this.filePath) {
        throw new Error('No file path provided');
      }

      // Simulate file writing
      console.log(`Writing data to file: ${this.filePath}`);
      this.output = { result: `Simulated writing data to file: ${this.filePath}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
