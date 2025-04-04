import { BaseSinkNode, SinkNodeInputs } from "../BaseSinkNode";

export class MediaViewerNode extends BaseSinkNode {
  constructor(id: string, alias: string) {
    super(id, alias);
    this.type = 'media-viewer';
  }

  async process(inputs: SinkNodeInputs): Promise<void> {
    try {
      this.status = 'running';
      // Simulate media viewing logic
      console.log('Simulated media viewer:', inputs);
      this.status = 'completed';
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
