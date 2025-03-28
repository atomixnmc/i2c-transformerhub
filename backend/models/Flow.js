const mongoose = require('mongoose');
const { Schema } = mongoose;

const FlowSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  nodes: [{
    id: {
      type: String,
      required: true
    },
    alias: String,
    type: {
      type: String,
      required: true
    },
    position: {
      x: Number,
      y: Number
    },
    properties: Schema.Types.Mixed
  }],
  connections: [{
    id: {
      type: String,
      required: true
    },
    sourceNodeId: {
      type: String,
      required: true
    },
    targetNodeId: {
      type: String,
      required: true
    },
    outputName: {
      type: String,
      default: 'output'
    },
    inputName: {
      type: String,
      default: 'data'
    }
  }],
  context: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
FlowSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a model from the schema
const Flow = mongoose.model('Flow', FlowSchema);

module.exports = Flow;
