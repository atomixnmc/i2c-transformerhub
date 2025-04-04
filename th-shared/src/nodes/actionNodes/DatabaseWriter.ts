import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class DatabaseWriter extends BaseActionNode {
  connectionString: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'database-writer';
    this.connectionString = options.connectionString || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const data = inputs.data;
      if (!data) {
        throw new Error('No data provided for database writing');
      }

      if (!this.connectionString) {
        throw new Error('No database connection string provided');
      }

      // Simulate database writing
      console.log(`Writing data to database with connection string: ${this.connectionString}`);
      this.output = { result: 'Simulated database write operation' };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
