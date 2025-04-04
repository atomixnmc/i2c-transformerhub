import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class CustomScriptNode extends BaseActionNode {
  script: string;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'custom-script';
    this.script = options.script || '';
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      if (!this.script) {
        throw new Error('No script provided');
      }

      // Simulate script execution
      console.log(`Executing script: ${this.script}`);
      this.output = { result: `Simulated execution of script: ${this.script}` };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
