import mongoose, { Schema, Document } from 'mongoose';

export interface IFlow extends Document {
  name: string;
  description?: string;
  nodes: Array<{
    id: string;
    alias?: string;
    type: string;
    position?: { x: number; y: number };
    properties?: Record<string, any>;
  }>;
  connections: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    outputName?: string;
    inputName?: string;
  }>;
  context?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const FlowSchema = new Schema<IFlow>({
  // ...existing schema with type annotations...
});

FlowSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Flow = mongoose.model<IFlow>('Flow', FlowSchema);

export default Flow;
