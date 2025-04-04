import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class EmailSender extends BaseActionNode {
  emailConfig: any;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'email-sender';
    this.emailConfig = options.emailConfig || {};
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const emailData = inputs.emailData;
      if (!emailData) {
        throw new Error('No email data provided');
      }

      // Simulate email sending
      console.log('Sending email with config:', this.emailConfig);
      this.output = { result: 'Simulated email sent' };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
