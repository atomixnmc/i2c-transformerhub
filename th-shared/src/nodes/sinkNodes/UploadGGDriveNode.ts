import { BaseSinkNode, SinkNodeInputs } from "../BaseSinkNode";

export class UploadGGDriveNode extends BaseSinkNode {
  constructor(id: string, alias: string) {
    super(id, alias);
    this.type = 'upload-to-google-drive';
  }

  async process(inputs: SinkNodeInputs): Promise<void> {
    try {
      this.status = 'running';
      // Simulate Google Drive upload logic
      console.log('Simulated upload to Google Drive:', inputs);
      this.status = 'completed';
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
