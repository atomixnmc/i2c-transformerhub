import { ActionNodeOptions, ActionNodeInputs, BaseActionNode } from "../BaseActionNode";
import { simulateJSONValidation } from "../../simulation/simulation";

export class JSONValidatorNode extends BaseActionNode {
  schema: any;
  strictMode: boolean;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'json-validator';
    this.schema = options.schema || {};
    this.strictMode = options.strictMode !== false;
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const data = inputs.data;
      if (!data) {
        throw new Error('No input data provided');
      }

      const validationResult = await simulateJSONValidation(data, this.schema, this.strictMode);

      if (!validationResult.valid) {
        if (this.strictMode) {
          throw new Error(`JSON validation failed: ${validationResult.errors.join(', ')}`);
        } else {
          this.output = {
            data,
            valid: false,
            errors: validationResult.errors,
          };
        }
      } else {
        this.output = {
          data,
          valid: true,
          errors: [],
        };
      }

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
