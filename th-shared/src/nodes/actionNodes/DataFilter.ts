import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class DataFilter extends BaseActionNode {
  filterCondition: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'data-filter';
    this.filterCondition = options.filterCondition || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const data = inputs.data;
      if (!data || !Array.isArray(data)) {
        throw new Error('No data provided for filtering');
      }

      if (!this.filterCondition) {
        throw new Error('No filter condition provided');
      }

      // Simulate data filtering
      console.log(`Filtering data with condition: ${this.filterCondition}`);
      this.output = { result: `Simulated filtered data with condition: ${this.filterCondition}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
