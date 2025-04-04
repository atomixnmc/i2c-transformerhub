import { BaseDataNode, DataNodeOptions } from "../BaseDataNode";
import { simulateFileLoad } from "../../simulation/simulation";

export class JSONFileNode extends BaseDataNode {
  filePath: string;
  schema: any;

  constructor(id: string, alias: string, options: DataNodeOptions = {}) {
    super(id, alias);
    this.type = 'json-file';
    this.filePath = options.filePath || '';
    this.schema = options.schema || null;
  }

  async load(): Promise<any> {
    try {
      this.status = 'running';

      if (!this.filePath) {
        throw new Error('File path not specified');
      }

      const fileContent = await simulateFileLoad(this.filePath);
      this.data = JSON.parse(fileContent);

      if (this.schema) {
        // Schema validation would happen here
      }

      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = (error as Error).message;
      throw error;
    }
  }
}
