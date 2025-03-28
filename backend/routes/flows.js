const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Flow = require('../models/Flow');
const config = require('../config');

// Import shared runtime
const { Runtime, FlowManager, MemoryStorage } = require('../../shared/runtime');

// Create a flow manager instance
const storage = config.database.useMongoose ? new MongooseStorage(Flow) : new MemoryStorage();
const flowManager = new FlowManager(storage);

// MongoDB storage adapter
class MongooseStorage {
  constructor(model) {
    this.model = model;
  }

  async saveItem(key, value) {
    const id = key.replace('flow:', '');
    const existingFlow = await this.model.findById(id);
    
    if (existingFlow) {
      // Update existing flow
      Object.assign(existingFlow, value);
      await existingFlow.save();
      return existingFlow.toObject();
    } else {
      // Create new flow
      const newFlow = new this.model(value);
      newFlow._id = id;
      await newFlow.save();
      return newFlow.toObject();
    }
  }

  async getItem(key) {
    const id = key.replace('flow:', '');
    const flow = await this.model.findById(id);
    return flow ? flow.toObject() : null;
  }

  async removeItem(key) {
    const id = key.replace('flow:', '');
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async listItems() {
    const flows = await this.model.find();
    return flows.map(flow => ({
      key: `flow:${flow._id}`,
      value: flow.toObject()
    }));
  }
}

// Get all flows
router.get('/', async (req, res, next) => {
  try {
    const flows = await flowManager.listFlows();
    res.json(flows);
  } catch (err) {
    next(err);
  }
});

// Get a specific flow
router.get('/:id', async (req, res, next) => {
  try {
    const flow = await flowManager.getFlow(req.params.id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    res.json(flow);
  } catch (err) {
    next(err);
  }
});

// Create a new flow
router.post('/', async (req, res, next) => {
  try {
    const { name, description, nodes, connections, context } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Flow name is required' });
    }
    
    const id = uuidv4();
    const flow = await flowManager.saveFlow(id, {
      name,
      description,
      nodes: nodes || [],
      connections: connections || [],
      context: context || {}
    });
    
    res.status(201).json(flow);
  } catch (err) {
    next(err);
  }
});

// Update a flow
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, nodes, connections, context } = req.body;
    const existingFlow = await flowManager.getFlow(req.params.id);
    
    if (!existingFlow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    const updatedFlow = await flowManager.saveFlow(req.params.id, {
      ...existingFlow,
      name: name || existingFlow.name,
      description: description !== undefined ? description : existingFlow.description,
      nodes: nodes || existingFlow.nodes,
      connections: connections || existingFlow.connections,
      context: context || existingFlow.context
    });
    
    res.json(updatedFlow);
  } catch (err) {
    next(err);
  }
});

// Delete a flow
router.delete('/:id', async (req, res, next) => {
  try {
    const existingFlow = await flowManager.getFlow(req.params.id);
    
    if (!existingFlow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    await flowManager.deleteFlow(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// Execute a flow
router.post('/:id/execute', async (req, res, next) => {
  try {
    const flow = await flowManager.getFlow(req.params.id);
    
    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }
    
    // Create a runtime instance
    const runtime = new Runtime();
    
    // Load the flow definition
    runtime.loadDefinition(flow);
    
    // Execute the flow
    const result = await runtime.execute();
    
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Pause a running flow
router.post('/:id/pause', async (req, res, next) => {
  try {
    // In a real implementation, we would store runtime instances
    // For now, we'll just return a simulated response
    res.json({
      status: 'paused',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Resume a paused flow
router.post('/:id/resume', async (req, res, next) => {
  try {
    // In a real implementation, we would retrieve and resume the runtime instance
    // For now, we'll just return a simulated response
    res.json({
      status: 'running',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

// Stop a running or paused flow
router.post('/:id/stop', async (req, res, next) => {
  try {
    // In a real implementation, we would retrieve and stop the runtime instance
    // For now, we'll just return a simulated response
    res.json({
      status: 'stopped',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
