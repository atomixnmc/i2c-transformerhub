// Runtime Library for TransformerHub
// This module provides the execution engine for dataflow networks

/**
 * Runtime class for executing dataflow networks
 */
class Runtime {
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

  /**
   * Register a node with the runtime
   * @param {Object} node Node to register
   */
  registerNode(node) {
    if (!node.id) {
      throw new Error('Node must have an id');
    }
    
    this.nodes.set(node.id, node);
    
    // If there's a status change handler, subscribe to this node's status changes
    if (this.onNodeStatusChange) {
      const originalSetStatus = node.status;
      node.status = (status) => {
        originalSetStatus.call(node, status);
        this.onNodeStatusChange(node.id, status);
      };
    }
    
    return this;
  }

  /**
   * Register multiple nodes with the runtime
   * @param {Array} nodes Nodes to register
   */
  registerNodes(nodes) {
    if (!Array.isArray(nodes)) {
      throw new Error('Nodes must be an array');
    }
    
    for (const node of nodes) {
      this.registerNode(node);
    }
    
    return this;
  }

  /**
   * Remove a node from the runtime
   * @param {string} nodeId ID of the node to remove
   */
  removeNode(nodeId) {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    
    this.nodes.delete(nodeId);
    
    // Remove any connections involving this node
    this.connections = this.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    
    return this;
  }

  /**
   * Add a connection between nodes
   * @param {string} sourceNodeId ID of the source node
   * @param {string} targetNodeId ID of the target node
   * @param {string} outputName Name of the output from the source node
   * @param {string} inputName Name of the input on the target node
   */
  addConnection(sourceNodeId, targetNodeId, outputName = 'output', inputName = 'data') {
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

  /**
   * Remove a connection
   * @param {string} connectionId ID of the connection to remove
   */
  removeConnection(connectionId) {
    const index = this.connections.findIndex(conn => conn.id === connectionId);
    
    if (index === -1) {
      throw new Error(`Connection with id ${connectionId} not found`);
    }
    
    this.connections.splice(index, 1);
    
    return this;
  }

  /**
   * Set global context data
   * @param {string} key Context key
   * @param {any} value Context value
   */
  setContext(key, value) {
    this.context[key] = value;
    return this;
  }

  /**
   * Get global context data
   * @param {string} key Context key
   * @returns {any} Context value
   */
  getContext(key) {
    return this.context[key];
  }

  /**
   * Clear the global context
   */
  clearContext() {
    this.context = {};
    return this;
  }

  /**
   * Find source nodes (nodes with no incoming connections)
   * @returns {Array} Array of source node IDs
   */
  findSourceNodes() {
    const targetNodeIds = new Set(this.connections.map(conn => conn.targetNodeId));
    
    return Array.from(this.nodes.keys())
      .filter(nodeId => !targetNodeIds.has(nodeId));
  }

  /**
   * Find nodes that are ready to execute (all inputs are available)
   * @param {Set} executedNodes Set of already executed node IDs
   * @returns {Array} Array of node IDs ready to execute
   */
  findReadyNodes(executedNodes) {
    const readyNodes = [];
    
    for (const [nodeId, node] of this.nodes.entries()) {
      // Skip already executed nodes
      if (executedNodes.has(nodeId)) {
        continue;
      }
      
      // Find incoming connections to this node
      const incomingConnections = this.connections.filter(
        conn => conn.targetNodeId === nodeId
      );
      
      // Check if all source nodes for these connections have been executed
      const allSourcesExecuted = incomingConnections.every(
        conn => executedNodes.has(conn.sourceNodeId)
      );
      
      if (allSourcesExecuted) {
        readyNodes.push(nodeId);
      }
    }
    
    return readyNodes;
  }

  /**
   * Execute a single node
   * @param {string} nodeId ID of the node to execute
   * @param {Object} inputs Input data for the node
   * @returns {Promise<any>} Output data from the node
   */
  async executeNode(nodeId, inputs = {}) {
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      throw new Error(`Node with id ${nodeId} not found`);
    }
    
    try {
      // For data source nodes
      if (typeof node.load === 'function') {
        return await node.load();
      }
      
      // For action nodes
      if (typeof node.process === 'function') {
        return await node.process(inputs);
      }
      
      throw new Error(`Node ${nodeId} has no executable method`);
    } catch (error) {
      // Set error on the node
      node.error = error.message;
      node.status = 'error';
      
      // Re-throw the error
      throw error;
    }
  }

  /**
   * Execute the entire dataflow network
   * @returns {Promise<Object>} Execution results
   */
  async execute() {
    if (this.status === 'running') {
      throw new Error('Runtime is already running');
    }
    
    this.setStatus('running');
    this.error = null;
    this.executedNodes = new Set();
    this.pauseRequested = false;
    
    try {
      // Find source nodes to start execution
      const sourceNodeIds = this.findSourceNodes();
      
      if (sourceNodeIds.length === 0) {
        throw new Error('No source nodes found in the dataflow');
      }
      
      // Initialize execution queue with source nodes
      this.executionQueue = [...sourceNodeIds];
      
      // Execute nodes in the queue
      while (this.executionQueue.length > 0 && !this.pauseRequested) {
        const nodeId = this.executionQueue.shift();
        const node = this.nodes.get(nodeId);
        
        // Skip if node was already executed
        if (this.executedNodes.has(nodeId)) {
          continue;
        }
        
        // Prepare inputs for the node
        const inputs = {};
        
        // Find incoming connections to this node
        const incomingConnections = this.connections.filter(
          conn => conn.targetNodeId === nodeId
        );
        
        // Collect inputs from source nodes
        for (const conn of incomingConnections) {
          const sourceNode = this.nodes.get(conn.sourceNodeId);
          
          if (!sourceNode) {
            throw new Error(`Source node ${conn.sourceNodeId} not found`);
          }
          
          // Get output from the source node
          const output = conn.outputName === 'output' 
            ? sourceNode.output 
            : sourceNode[conn.outputName];
          
          // Set input on the target node
          inputs[conn.inputName] = output;
        }
        
        // Execute the node
        node.status = 'running';
        
        try {
          const output = await this.executeNode(nodeId, inputs);
          node.output = output;
          node.status = 'completed';
          
          // Mark node as executed
          this.executedNodes.add(nodeId);
          
          // Find outgoing connections from this node
          const outgoingConnections = this.connections.filter(
            conn => conn.sourceNodeId === nodeId
          );
          
          // Add target nodes to the execution queue
          for (const conn of outgoingConnections) {
            if (!this.executionQueue.includes(conn.targetNodeId) && 
                !this.executedNodes.has(conn.targetNodeId)) {
              this.executionQueue.push(conn.targetNodeId);
            }
          }
          
          // Add any other ready nodes to the queue
          const readyNodes = this.findReadyNodes(this.executedNodes);
          
          for (const readyNodeId of readyNodes) {
            if (!this.executionQueue.includes(readyNodeId) && 
                !this.executedNodes.has(readyNodeId)) {
              this.executionQueue.push(readyNodeId);
            }
          }
        } catch (error) {
          // Node execution failed
          node.status = 'error';
          node.error = error.message;
          
          // If we're in strict mode, stop execution
          if (this.context.strictMode) {
            throw error;
          }
          
          // Otherwise, continue with other nodes
          console.error(`Error executing node ${nodeId}: ${error.message}`);
        }
      }
      
      // Check if execution was paused
      if (this.pauseRequested) {
        this.setStatus('paused');
        
        if (this.onExecutionComplete) {
          this.onExecutionComplete({
            status: 'paused',
            executedNodes: Array.from(this.executedNodes),
            pendingNodes: this.executionQueue,
            context: this.context
          });
        }
        
        return {
          status: 'paused',
          executedNodes: Array.from(this.executedNodes),
          pendingNodes: this.executionQueue,
          context: this.context
        };
      }
      
      // Execution completed successfully
      this.setStatus('completed');
      
      const results = {
        status: 'completed',
        executedNodes: Array.from(this.executedNodes),
        outputs: {},
        context: this.context
      };
      
      // Collect outputs from all nodes
      for (const [nodeId, node] of this.nodes.entries()) {
        if (node.output !== undefined) {
          results.outputs[nodeId] = node.output;
        }
      }
      
      if (this.onExecutionComplete) {
        this.onExecutionComplete(results);
      }
      
      return results;
    } catch (error) {
      // Execution failed
      this.setStatus('error');
      this.error = error.message;
      
      const results = {
        status: 'error',
        error: error.message,
        executedNodes: Array.from(this.executedNodes),
        context: this.context
      };
      
      if (this.onExecutionComplete) {
        this.onExecutionComplete(results);
      }
      
      return results;
    }
  }

  /**
   * Pause the execution
   */
  pause() {
    if (this.status !== 'running') {
      throw new Error('Runtime is not running');
    }
    
    this.pauseRequested = true;
    return this;
  }

  /**
   * Resume a paused execution
   * @returns {Promise<Object>} Execution results
   */
  async resume() {
    if (this.status !== 'paused') {
      throw new Error('Runtime is not paused');
    }
    
    this.pauseRequested = false;
    return this.execute();
  }

  /**
   * Stop the execution
   */
  stop() {
    if (this.status !== 'running' && this.status !== 'paused') {
      throw new Error('Runtime is not running or paused');
    }
    
    this.executionQueue = [];
    this.setStatus('stopped');
    
    return this;
  }

  /**
   * Reset the runtime
   */
  reset() {
    this.executionQueue = [];
    this.executedNodes = new Set();
    this.pauseRequested = false;
    this.error = null;
    this.setStatus('idle');
    
    // Reset all nodes
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

  /**
   * Set the runtime status and trigger the status change callback
   * @param {string} status New status
   */
  setStatus(status) {
    this.status = status;
    
    if (this.onStatusChange) {
      this.onStatusChange(status);
    }
    
    return this;
  }

  /**
   * Get the current state of the runtime
   * @returns {Object} Runtime state
   */
  getState() {
    const nodes = {};
    
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

  /**
   * Load a dataflow definition
   * @param {Object} definition Dataflow definition
   * @returns {Runtime} Runtime instance
   */
  loadDefinition(definition) {
    // Reset the runtime
    this.reset();
    
    // Clear existing nodes and connections
    this.nodes.clear();
    this.connections = [];
    
    // Load context
    if (definition.context) {
      this.context = { ...definition.context };
    }
    
    // Load nodes
    if (definition.nodes && Array.isArray(definition.nodes)) {
      for (const nodeDefinition of definition.nodes) {
        // Node factory would be used here in a real implementation
        // For now, we'll just create a placeholder node
        const node = {
          id: nodeDefinition.id,
          alias: nodeDefinition.alias || nodeDefinition.id,
          type: nodeDefinition.type,
          status: 'idle',
          error: null,
          output: null,
          ...nodeDefinition.properties
        };
        
        this.nodes.set(node.id, node);
      }
    }
    
    // Load connections
    if (definition.connections && Array.isArray(definition.connections)) {
      this.connections = [...definition.connections];
    }
    
    return this;
  }

  /**
   * Export the current dataflow as a definition
   * @returns {Object} Dataflow definition
   */
  exportDefinition() {
    const nodes = [];
    
    for (const [nodeId, node] of this.nodes.entries()) {
      const nodeDefinition = {
        id: node.id,
        alias: node.alias,
        type: node.type,
        properties: {}
      };
      
      // Copy all properties except for internal ones
      for (const [key, value] of Object.entries(node)) {
        if (!['id', 'alias', 'type', 'status', 'error', 'output', 'inputs'].includes(key)) {
          nodeDefinition.properties[key] = value;
        }
      }
      
      nodes.push(nodeDefinition);
    }
    
    return {
      nodes,
      connections: this.connections,
      context: this.context
    };
  }
}

/**
 * Factory for creating nodes
 */
class NodeFactory {
  constructor() {
    this.nodeTypes = new Map();
  }

  /**
   * Register a node type
   * @param {string} type Node type name
   * @param {Function} constructor Node constructor
   */
  registerNodeType(type, constructor) {
    this.nodeTypes.set(type, constructor);
    return this;
  }

  /**
   * Create a node instance
   * @param {string} type Node type name
   * @param {string} id Node ID
   * @param {string} alias Node alias
   * @param {Object} options Node options
   * @returns {Object} Node instance
   */
  createNode(type, id, alias, options = {}) {
    const Constructor = this.nodeTypes.get(type);
    
    if (!Constructor) {
      throw new Error(`Node type ${type} not registered`);
    }
    
    return new Constructor(id, alias, options);
  }

  /**
   * Get all registered node types
   * @returns {Array} Array of node type names
   */
  getNodeTypes() {
    return Array.from(this.nodeTypes.keys());
  }

  /**
   * Check if a node type is registered
   * @param {string} type Node type name
   * @returns {boolean} True if the node type is registered
   */
  hasNodeType(type) {
    return this.nodeTypes.has(type);
  }
}

/**
 * Flow definition manager
 */
class FlowManager {
  constructor(storage) {
    this.storage = storage || new MemoryStorage();
  }

  /**
   * Save a flow definition
   * @param {string} id Flow ID
   * @param {Object} definition Flow definition
   * @returns {Promise<Object>} Saved flow definition
   */
  async saveFlow(id, definition) {
    definition.id = id;
    definition.updatedAt = new Date().toISOString();
    
    if (!definition.createdAt) {
      definition.createdAt = definition.updatedAt;
    }
    
    await this.storage.saveItem(`flow:${id}`, definition);
    return definition;
  }

  /**
   * Get a flow definition
   * @param {string} id Flow ID
   * @returns {Promise<Object>} Flow definition
   */
  async getFlow(id) {
    return this.storage.getItem(`flow:${id}`);
  }

  /**
   * Delete a flow definition
   * @param {string} id Flow ID
   * @returns {Promise<boolean>} True if the flow was deleted
   */
  async deleteFlow(id) {
    return this.storage.removeItem(`flow:${id}`);
  }

  /**
   * List all flow definitions
   * @returns {Promise<Array>} Array of flow definitions
   */
  async listFlows() {
    const items = await this.storage.listItems();
    
    return items
      .filter(item => item.key.startsWith('flow:'))
      .map(item => item.value);
  }
}

/**
 * Memory storage implementation
 */
class MemoryStorage {
  constructor() {
    this.items = new Map();
  }

  /**
   * Save an item
   * @param {string} key Item key
   * @param {any} value Item value
   * @returns {Promise<void>}
   */
  async saveItem(key, value) {
    this.items.set(key, value);
  }

  /**
   * Get an item
   * @param {string} key Item key
   * @returns {Promise<any>} Item value
   */
  async getItem(key) {
    return this.items.get(key);
  }

  /**
   * Remove an item
   * @param {string} key Item key
   * @returns {Promise<boolean>} True if the item was removed
   */
  async removeItem(key) {
    return this.items.delete(key);
  }

  /**
   * List all items
   * @returns {Promise<Array>} Array of items
   */
  async listItems() {
    return Array.from(this.items.entries()).map(([key, value]) => ({ key, value }));
  }
}

// Export the classes
module.exports = {
  Runtime,
  NodeFactory,
  FlowManager,
  MemoryStorage
};
