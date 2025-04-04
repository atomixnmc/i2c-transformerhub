import { BaseSinkNode, SinkNodeInputs, SinkNodeOptions } from "../BaseSinkNode";

export class SendEmailNode extends BaseSinkNode {
  server: string;
  username: string;
  password: string;
  from: string;
  to: string;
  subject: string;
  isHtml: boolean;

  constructor(id: string, alias: string, options: SinkNodeOptions = {}) {
    super(id, alias);
    this.type = 'send-email';
    this.server = options.server || '';
    this.username = options.username || '';
    this.password = options.password || '';
    this.from = options.from || '';
    this.to = options.to || '';
    this.subject = options.subject || '';
    this.isHtml = options.isHtml || false;
  }

  async process(inputs: SinkNodeInputs): Promise<void> {
    try {
      this.status = 'running';
      // Simulate email sending logic
      console.log(`Simulated email sent to ${this.to}`);
      this.status = 'completed';
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
