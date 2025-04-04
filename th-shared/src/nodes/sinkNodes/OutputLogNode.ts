import { BaseSinkNode, SinkNodeInputs } from "../BaseSinkNode";

export class OutputLogNode extends BaseSinkNode {
  constructor(id: string, alias: string) {
    super(id, alias);
    this.type = 'output-log';
  }

  async process(inputs: SinkNodeInputs): Promise<void> {
    try {
      this.status = 'running';
      console.log('OutputLogNode:', inputs);
      this.status = 'completed';
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
