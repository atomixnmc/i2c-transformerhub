import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class DataJoiner extends BaseActionNode {
  joinKey: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'data-joiner';
    this.joinKey = options.joinKey || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const dataSources = inputs.dataSources;
      if (!dataSources || !Array.isArray(dataSources)) {
        throw new Error('No data sources provided for joining');
      }

      if (!this.joinKey) {
        throw new Error('No join key provided');
      }

      // Simulate data joining
      console.log(`Joining data sources with key: ${this.joinKey}`);
      this.output = { result: 'Simulated joined data' };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
