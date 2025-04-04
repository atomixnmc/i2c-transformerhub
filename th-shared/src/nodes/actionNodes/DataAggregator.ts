import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class DataAggregator extends BaseActionNode {
  aggregationType: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'data-aggregator';
    this.aggregationType = options.aggregationType || 'sum';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const dataSources = inputs.dataSources;
      if (!dataSources || !Array.isArray(dataSources)) {
        throw new Error('No data sources provided for aggregation');
      }

      // Simulate data aggregation
      console.log(`Aggregating data with type: ${this.aggregationType}`);
      this.output = { result: `Simulated data aggregation of type: ${this.aggregationType}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
