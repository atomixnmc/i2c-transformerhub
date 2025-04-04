// Runtime Library for TransformerHub
// This module provides the execution engine for dataflow networks

import { Storage } from "./storages/BaseStorage";

interface Node {
  id: string;
  alias?: string;
  type: string;
  status: string | ((arg: string) => void);
  error?: string | null;
  output?: any;
  inputs?: Record<string, any>;
  load?: () => Promise<any>;
  process?: (inputs: Record<string, any>) => Promise<any>;
  properties?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}

interface Connection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  outputName: string;
  inputName: string;
}

interface FlowDefinition {
  context?: Record<string, any>;
}


/**
 * Interface for flow definition
 */
interface FlowDefinition {
  id?: string;
  name: string;
  description?: string;
  nodes?: Array<Partial<Node>>;
  connections?: Connection[];
  nodesDef?: NodeDefinition[];
  connectionsDef?: ConnectionDefinition[];
  context?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for node definition
 */
interface NodeDefinition {
  id: string;
  alias: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  properties: Record<string, any>;
}

/**
 * Interface for connection definition
 */
interface ConnectionDefinition {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  outputName: string;
  inputName: string;
}

interface ExecutionResults {
  status: string;
  executedNodes: string[];
  outputs?: Record<string, any>;
  context: Record<string, any>;
  error?: string;
  pendingNodes?: string[];
}

interface NodeConstructor {
  new (id: string, alias: string, options?: Record<string, any>): any;
}

class NodeFactory {
  private nodeTypes: Map<string, NodeConstructor>;

  constructor() {
    this.nodeTypes = new Map<string, NodeConstructor>();
  }

  /**
   * Register a node type
   * @param type Node type name
   * @param constructor Node constructor
   */
  registerNodeType(type: string, constructor: NodeConstructor): this {
    this.nodeTypes.set(type, constructor);
    return this;
  }

  /**
   * Create a node instance
   * @param type Node type name
   * @param id Node ID
   * @param alias Node alias
   * @param options Node options
   * @returns Node instance
   */
  createNode(type: string, id: string, alias: string, options: Record<string, any> = {}): any {
    const Constructor = this.nodeTypes.get(type);

    if (!Constructor) {
      throw new Error(`Node type ${type} not registered`);
    }

    return new Constructor(id, alias, options);
  }

  /**
   * Get all registered node types
   * @returns Array of node type names
   */
  getNodeTypes(): string[] {
    return Array.from(this.nodeTypes.keys());
  }

  /**
   * Check if a node type is registered
   * @param type Node type name
   * @returns True if the node type is registered
   */
  hasNodeType(type: string): boolean {
    return this.nodeTypes.has(type);
  }
}

class Runtime {
  private nodes: Map<string, Node>;
  private connections: Connection[];
  private context: Record<string, any>;
  private status: string;
  private error: string | null;
  private executionQueue: string[];
  private executedNodes: Set<string>;
  private pauseRequested: boolean;
  private onStatusChange: ((status: string) => void) | null;
  private onNodeStatusChange: ((nodeId: string, status: string) => void) | null;
  private onExecutionComplete: ((results: ExecutionResults) => void) | null;

  constructor() {
    this.nodes = new Map();
    this.connections = [];
    this.context = {};
    this.status = 'idle';
    this.error = null;
    this.executionQueue = [];
    this.executedNodes = new Set();
    this.pauseRequested = false;
    this.onStatusChange = null;
    this.onNodeStatusChange = null;
    this.onExecutionComplete = null;
  }

  registerNode(node: Node): this {
    if (!node.id) {
      throw new Error('Node must have an id');
    }
    this.nodes.set(node.id, node);
    if (this.onNodeStatusChange) {
      const originalSetStatus = node.status;
      node.status = (status: string) => {
        if (typeof originalSetStatus === 'function') {
          originalSetStatus.call(node, status);
        }
        this.onNodeStatusChange!(node.id, status);
      };
    }
    return this;
  }

  registerNodes(nodes: Node[]): this {
    if (!Array.isArray(nodes)) {
      throw new Error('Nodes must be an array');
    }
    for (const node of nodes) {
      this.registerNode(node);
    }
    return this;
  }

  removeNode(nodeId: string): this {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    this.nodes.delete(nodeId);
    this.connections = this.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    return this;
  }

  addConnection(sourceNodeId: string, targetNodeId: string, outputName = 'output', inputName = 'data'): this {
    if (!this.nodes.has(sourceNodeId)) {
      throw new Error(`Source node with id ${sourceNodeId} not found`);
    }
    if (!this.nodes.has(targetNodeId)) {
      throw new Error(`Target node with id ${targetNodeId} not found`);
    }
    this.connections.push({
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId,
      targetNodeId,
      outputName,
      inputName
    });
    return this;
  }

  removeConnection(connectionId: string): this {
    const index = this.connections.findIndex(conn => conn.id === connectionId);
    if (index === -1) {
      throw new Error(`Connection with id ${connectionId} not found`);
    }
    this.connections.splice(index, 1);
    return this;
  }

  setContext(key: string, value: any): this {
    this.context[key] = value;
    return this;
  }

  getContext(key: string): any {
    return this.context[key];
  }

  clearContext(): this {
    this.context = {};
    return this;
  }

  findSourceNodes(): string[] {
    const targetNodeIds = new Set(this.connections.map(conn => conn.targetNodeId));
    return Array.from(this.nodes.keys()).filter(nodeId => !targetNodeIds.has(nodeId));
  }

  findReadyNodes(executedNodes: Set<string>): string[] {
    const readyNodes: string[] = [];
    for (const [nodeId, node] of this.nodes.entries()) {
      if (executedNodes.has(nodeId)) continue;
      const incomingConnections = this.connections.filter(conn => conn.targetNodeId === nodeId);
      const allSourcesExecuted = incomingConnections.every(conn => executedNodes.has(conn.sourceNodeId));
      if (allSourcesExecuted) readyNodes.push(nodeId);
    }
    return readyNodes;
  }

  async executeNode(nodeId: string, inputs: Record<string, any> = {}): Promise<any> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    try {
      if (typeof node.load === 'function') {
        return await node.load();
      }
      if (typeof node.process === 'function') {
        return await node.process(inputs);
      }
      throw new Error(`Node ${nodeId} has no executable method`);
    } catch (error) {
      node.error = (error as Error).message;
      node.status = 'error';
      throw error;
    }
  }

  async execute(): Promise<ExecutionResults> {
    if (this.status === 'running') {
      throw new Error('Runtime is already running');
    }
    this.setStatus('running');
    this.error = null;
    this.executedNodes = new Set();
    this.pauseRequested = false;

    try {
      const sourceNodeIds = this.findSourceNodes();
      if (sourceNodeIds.length === 0) {
        throw new Error('No source nodes found in the dataflow');
      }
      this.executionQueue = [...sourceNodeIds];

      while (this.executionQueue.length > 0 && !this.pauseRequested) {
        const nodeId = this.executionQueue.shift()!;
        const node = this.nodes.get(nodeId);
        if (!node || this.executedNodes.has(nodeId)) continue;

        const inputs: Record<string, any> = {};
        const incomingConnections = this.connections.filter(conn => conn.targetNodeId === nodeId);
        for (const conn of incomingConnections) {
          const sourceNode = this.nodes.get(conn.sourceNodeId);
          if (!sourceNode) {
            throw new Error(`Source node ${conn.sourceNodeId} not found`);
          }
          const output = conn.outputName === 'output' ? sourceNode.output : sourceNode[conn.outputName];
          inputs[conn.inputName] = output;
        }

        node.status = 'running';
        try {
          const output = await this.executeNode(nodeId, inputs);
          node.output = output;
          node.status = 'completed';
          this.executedNodes.add(nodeId);

          const outgoingConnections = this.connections.filter(conn => conn.sourceNodeId === nodeId);
          for (const conn of outgoingConnections) {
            if (!this.executionQueue.includes(conn.targetNodeId) && !this.executedNodes.has(conn.targetNodeId)) {
              this.executionQueue.push(conn.targetNodeId);
            }
          }

          const readyNodes = this.findReadyNodes(this.executedNodes);
          for (const readyNodeId of readyNodes) {
            if (!this.executionQueue.includes(readyNodeId) && !this.executedNodes.has(readyNodeId)) {
              this.executionQueue.push(readyNodeId);
            }
          }
        } catch (error) {
          node.status = 'error';
          node.error = (error as Error).message;
          if (this.context.strictMode) {
            throw error;
          }
          //console.error(`Error executing node ${nodeId}: ${(error as Error).message}`);
        }
      }

      if (this.pauseRequested) {
        this.setStatus('paused');
        const results = {
          status: 'paused',
          executedNodes: Array.from(this.executedNodes),
          pendingNodes: this.executionQueue,
          context: this.context
        };
        if (this.onExecutionComplete) this.onExecutionComplete(results);
        return results;
      }

      this.setStatus('completed');
      const results: ExecutionResults = {
        status: 'completed',
        executedNodes: Array.from(this.executedNodes),
        outputs: {},
        context: this.context
      };
      for (const [nodeId, node] of this.nodes.entries()) {
        if (node.output !== undefined) {
          results.outputs![nodeId] = node.output;
        }
      }
      if (this.onExecutionComplete) this.onExecutionComplete(results);
      return results;
    } catch (error) {
      this.setStatus('error');
      this.error = (error as Error).message;
      const results = {
        status: 'error',
        error: (error as Error).message,
        executedNodes: Array.from(this.executedNodes),
        context: this.context
      };
      if (this.onExecutionComplete) this.onExecutionComplete(results);
      return results;
    }
  }

  pause(): this {
    if (this.status !== 'running') {
      throw new Error('Runtime is not running');
    }
    this.pauseRequested = true;
    return this;
  }

  async resume(): Promise<ExecutionResults> {
    if (this.status !== 'paused') {
      throw new Error('Runtime is not paused');
    }
    this.pauseRequested = false;
    return this.execute();
  }

  stop(): this {
    if (this.status !== 'running' && this.status !== 'paused') {
      throw new Error('Runtime is not running or paused');
    }
    this.executionQueue = [];
    this.setStatus('stopped');
    return this;
  }

  reset(): this {
    this.executionQueue = [];
    this.executedNodes = new Set();
    this.pauseRequested = false;
    this.error = null;
    this.setStatus('idle');
    for (const node of this.nodes.values()) {
      node.status = 'idle';
      node.error = null;
      node.output = null;
      if (node.inputs) {
        node.inputs = {};
      }
    }
    return this;
  }

  setStatus(status: string): this {
    this.status = status;
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
    return this;
  }

  getState(): Record<string, any> {
    const nodes: Record<string, any> = {};
    for (const [nodeId, node] of this.nodes.entries()) {
      nodes[nodeId] = {
        id: node.id,
        alias: node.alias,
        type: node.type,
        status: node.status,
        error: node.error
      };
    }
    return {
      status: this.status,
      error: this.error,
      nodes,
      connections: this.connections,
      context: this.context,
      executedNodes: Array.from(this.executedNodes),
      pendingNodes: this.executionQueue
    };
  }

  loadDefinition(definition: FlowDefinition): this {
    this.reset();
    this.nodes.clear();
    this.connections = [];
    if (definition.context) {
      this.context = { ...definition.context };
    }
    if (definition.nodes && Array.isArray(definition.nodes)) {
      for (const nodeDefinition of definition.nodes) {
        const node: Node = {
          id: nodeDefinition.id!,
          alias: nodeDefinition.alias || nodeDefinition.id!,
          type: nodeDefinition.type!,
          status: 'idle',
          error: null,
          output: null,
          ...nodeDefinition.properties
        };
        this.nodes.set(node.id, node);
      }
    }
    if (definition.connections && Array.isArray(definition.connections)) {
      this.connections = [...definition.connections];
    }
    return this;
  }

  exportDefinition(): FlowDefinition {
    const nodes: Partial<Node>[] = [];
    for (const [nodeId, node] of this.nodes.entries()) {
      const nodeDefinition: Partial<Node> = {
        id: node.id,
        alias: node.alias,
        type: node.type,
        properties: {}
      };
      for (const [key, value] of Object.entries(node)) {
        if (!['id', 'alias', 'type', 'status', 'error', 'output', 'inputs'].includes(key)) {
          nodeDefinition.properties![key] = value;
        }
      }
      nodes.push(nodeDefinition);
    }
    return {
      nodes,
      connections: this.connections,
      context: this.context,
      name: 'Flow Definition',
      description: 'Exported flow definition',
    };
  }
}


/**
 * Flow definition manager
 */
class FlowManager {
  private storage: Storage;
  
  /**
   * Create a new FlowManager
   * @param storage Storage implementation to use
   */
  constructor(storage: Storage) {
    this.storage = storage;
  }

  /**
   * Save a flow definition
   * @param id Flow ID
   * @param definition Flow definition
   * @returns Promise resolving to the saved flow definition
   */
  async saveFlow(id: string, definition: Omit<FlowDefinition, 'id'>): Promise<FlowDefinition> {
    const flowWithId = {
      ...definition,
      id,
      updatedAt: new Date().toISOString()
    };
    
    if (!flowWithId.createdAt) {
      flowWithId.createdAt = flowWithId.updatedAt;
    }
    
    await this.storage.saveItem(`flow:${id}`, flowWithId);
    return flowWithId as FlowDefinition;
  }

  /**
   * Get a flow definition
   * @param id Flow ID
   * @returns Promise resolving to the flow definition or null if not found
   */
  async getFlow(id: string): Promise<FlowDefinition | null> {
    return this.storage.getItem(`flow:${id}`);
  }

  /**
   * Delete a flow definition
   * @param id Flow ID
   * @returns Promise resolving to true if the flow was deleted, false otherwise
   */
  async deleteFlow(id: string): Promise<boolean> {
    return this.storage.removeItem(`flow:${id}`);
  }

  /**
   * List all flow definitions
   * @returns Promise resolving to an array of flow definitions
   */
  async listFlows(): Promise<FlowDefinition[]> {
    const items = await this.storage.listItems();
    
    return items
      .filter(item => item.key.startsWith('flow:'))
      .map(item => item.value);
  }

  /**
   * Clone a flow definition
   * @param sourceId Source flow ID
   * @param targetId Target flow ID
   * @param newName Optional new name for the cloned flow
   * @returns Promise resolving to the cloned flow definition
   */
  async cloneFlow(sourceId: string, targetId: string, newName?: string): Promise<FlowDefinition | null> {
    const sourceFlow = await this.getFlow(sourceId);
    
    if (!sourceFlow) {
      return null;
    }
    
    const clonedFlow: Omit<FlowDefinition, 'id'> = {
      ...sourceFlow,
      name: newName || `${sourceFlow.name} (Clone)`,
      createdAt: undefined,
      updatedAt: undefined
    };
    
    return this.saveFlow(targetId, clonedFlow);
  }

  /**
   * Update a flow definition partially
   * @param id Flow ID
   * @param updates Partial flow definition updates
   * @returns Promise resolving to the updated flow definition
   */
  async updateFlow(id: string, updates: Partial<FlowDefinition>): Promise<FlowDefinition | null> {
    const existingFlow = await this.getFlow(id);
    
    if (!existingFlow) {
      return null;
    }
    
    const updatedFlow: Omit<FlowDefinition, 'id'> = {
      ...existingFlow,
      ...updates,
      // id: undefined // Remove id as it will be added by saveFlow
    };
    
    return this.saveFlow(id, updatedFlow);
  }

  /**
   * Check if a flow exists
   * @param id Flow ID
   * @returns Promise resolving to true if the flow exists, false otherwise
   */
  async flowExists(id: string): Promise<boolean> {
    const flow = await this.getFlow(id);
    return flow !== null;
  }

  /**
   * Search for flows by name or description
   * @param query Search query
   * @returns Promise resolving to an array of matching flow definitions
   */
  async searchFlows(query: string): Promise<FlowDefinition[]> {
    const flows = await this.listFlows();
    const lowerQuery = query.toLowerCase();
    
    return flows.filter(flow => 
      flow.name.toLowerCase().includes(lowerQuery) || 
      (flow.description && flow.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get the storage implementation
   * @returns The storage implementation
   */
  getStorage(): Storage {
    return this.storage;
  }

  /**
   * Set a new storage implementation
   * @param storage New storage implementation
   */
  setStorage(storage: Storage): void {
    this.storage = storage;
  }
}

// Export the class
export { Runtime, NodeFactory, FlowManager };  
export type { Node, Connection, FlowDefinition, ExecutionResults, NodeConstructor, Storage };

