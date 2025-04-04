import { BaseActionNode, ActionNodeInputs, ActionNodeOptions } from "../BaseActionNode";

export class NotificationSender extends BaseActionNode {
  notificationConfig: any;

  constructor(id: string, alias: string, options: ActionNodeOptions = {}) {
    super(id, alias);
    this.type = 'notification-sender';
    this.notificationConfig = options.notificationConfig || {};
  }

  async process(inputs: ActionNodeInputs): Promise<any> {
    try {
      this.status = 'running';

      const message = inputs.message;
      if (!message) {
        throw new Error('No message provided for notification');
      }

      // Simulate notification sending
      console.log('Sending notification with config:', this.notificationConfig);
      this.output = { result: 'Simulated notification sent' };

      this.status = 'completed';
      return this.output;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
