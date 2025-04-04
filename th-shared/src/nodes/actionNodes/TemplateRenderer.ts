import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class TemplateRenderer extends BaseActionNode {
  template: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'template-renderer';
    this.template = options.template || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const data = inputs.data;
      if (!data) {
        throw new Error('No data provided for template rendering');
      }

      if (!this.template) {
        throw new Error('No template provided');
      }

      // Simulate template rendering
      console.log(`Rendering template with data: ${JSON.stringify(data)}`);
      this.output = { result: `Simulated rendered template with data: ${JSON.stringify(data)}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
