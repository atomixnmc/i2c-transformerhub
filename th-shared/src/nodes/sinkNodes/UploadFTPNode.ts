import { BaseSinkNode, SinkNodeInputs, SinkNodeOptions } from "../BaseSinkNode";

export class UploadFTPNode extends BaseSinkNode {
  server: string;
  username: string;
  password: string;

  constructor(id: string, alias: string, options: SinkNodeOptions = {}) {
    super(id, alias);
    this.type = 'upload-to-ftp';
    this.server = options.server || '';
    this.username = options.username || '';
    this.password = options.password || '';
  }

  async process(inputs: SinkNodeInputs): Promise<void> {
    try {
      this.status = 'running';
      // Simulate FTP upload logic
      console.log(`Simulated upload to FTP server: ${this.server}`);
      this.status = 'completed';
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
