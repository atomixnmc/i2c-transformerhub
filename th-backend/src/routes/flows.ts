import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Flow from '../models/Flow';
import config from '../config';
import { Runtime, FlowManager, MemoryStorage } from 'th-shared';

const router = express.Router();

interface FlowData {
  name: string;
  description?: string;
  nodes: any[];
  connections: any[];
  context: Record<string, any>;
}

interface FlowResponse extends FlowData {
  id: string;
}

class MongooseStorage {
  private model: typeof Flow;

  constructor(model: typeof Flow) {
    this.model = model;
  }

  async saveItem(key: string, value: FlowData): Promise<FlowResponse> {
    const id = key.replace('flow:', '');
    const existingFlow = await this.model.findById(id);

    if (existingFlow) {
      Object.assign(existingFlow, value);
      await existingFlow.save();
      return { id, ...existingFlow.toObject() };
    } else {
      const newFlow = new this.model(value);
      newFlow._id = id;
      await newFlow.save();
      return { id, ...newFlow.toObject() };
    }
  }

  async getItem(key: string): Promise<FlowResponse | null> {
    const id = key.replace('flow:', '');
    const flow = await this.model.findById(id);
    return flow ? { id, ...flow.toObject() } : null;
  }

  async removeItem(key: string): Promise<boolean> {
    const id = key.replace('flow:', '');
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async listItems(): Promise<{ key: string; value: FlowResponse }[]> {
    const flows = await this.model.find();
    return flows.map(flow => ({
      key: `flow:${flow._id}`,
      value: { id: flow._id, ...flow.toObject() }
    }));
  }
}

const storage = config.database.useMongoose ? new MongooseStorage(Flow) : new MemoryStorage();
const flowManager = new FlowManager(storage);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flows = await flowManager.listFlows();
    res.json(flows);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, nodes, connections, context } = req.body as FlowData;

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

router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, nodes, connections, context } = req.body as FlowData;
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

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
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

router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flow = await flowManager.getFlow(req.params.id);

    if (!flow) {
      return res.status(404).json({ error: 'Flow not found' });
    }

    const runtime = new Runtime();
    runtime.loadDefinition(flow);
    const result = await runtime.execute();

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/pause', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: 'paused',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/resume', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: 'running',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/stop', async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      status: 'stopped',
      flowId: req.params.id,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
});

export default router;
