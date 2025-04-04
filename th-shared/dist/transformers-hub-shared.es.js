var g = Object.defineProperty;
var y = (i, s, t) => s in i ? g(i, s, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[s] = t;
var o = (i, s, t) => y(i, typeof s != "symbol" ? s + "" : s, t);
class yt {
  constructor() {
    o(this, "nodeTypes");
    this.nodeTypes = /* @__PURE__ */ new Map();
  }
  /**
   * Register a node type
   * @param type Node type name
   * @param constructor Node constructor
   */
  registerNodeType(s, t) {
    return this.nodeTypes.set(s, t), this;
  }
  /**
   * Create a node instance
   * @param type Node type name
   * @param id Node ID
   * @param alias Node alias
   * @param options Node options
   * @returns Node instance
   */
  createNode(s, t, e, r = {}) {
    const h = this.nodeTypes.get(s);
    if (!h)
      throw new Error(`Node type ${s} not registered`);
    return new h(t, e, r);
  }
  /**
   * Get all registered node types
   * @returns Array of node type names
   */
  getNodeTypes() {
    return Array.from(this.nodeTypes.keys());
  }
  /**
   * Check if a node type is registered
   * @param type Node type name
   * @returns True if the node type is registered
   */
  hasNodeType(s) {
    return this.nodeTypes.has(s);
  }
}
class wt {
  constructor() {
    o(this, "nodes");
    o(this, "connections");
    o(this, "context");
    o(this, "status");
    o(this, "error");
    o(this, "executionQueue");
    o(this, "executedNodes");
    o(this, "pauseRequested");
    o(this, "onStatusChange");
    o(this, "onNodeStatusChange");
    o(this, "onExecutionComplete");
    this.nodes = /* @__PURE__ */ new Map(), this.connections = [], this.context = {}, this.status = "idle", this.error = null, this.executionQueue = [], this.executedNodes = /* @__PURE__ */ new Set(), this.pauseRequested = !1, this.onStatusChange = null, this.onNodeStatusChange = null, this.onExecutionComplete = null;
  }
  registerNode(s) {
    if (!s.id)
      throw new Error("Node must have an id");
    if (this.nodes.set(s.id, s), this.onNodeStatusChange) {
      const t = s.status;
      s.status = (e) => {
        typeof t == "function" && t.call(s, e), this.onNodeStatusChange(s.id, e);
      };
    }
    return this;
  }
  registerNodes(s) {
    if (!Array.isArray(s))
      throw new Error("Nodes must be an array");
    for (const t of s)
      this.registerNode(t);
    return this;
  }
  removeNode(s) {
    if (!this.nodes.has(s))
      throw new Error(`Node with id ${s} not found`);
    return this.nodes.delete(s), this.connections = this.connections.filter(
      (t) => t.sourceNodeId !== s && t.targetNodeId !== s
    ), this;
  }
  addConnection(s, t, e = "output", r = "data") {
    if (!this.nodes.has(s))
      throw new Error(`Source node with id ${s} not found`);
    if (!this.nodes.has(t))
      throw new Error(`Target node with id ${t} not found`);
    return this.connections.push({
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: s,
      targetNodeId: t,
      outputName: e,
      inputName: r
    }), this;
  }
  removeConnection(s) {
    const t = this.connections.findIndex((e) => e.id === s);
    if (t === -1)
      throw new Error(`Connection with id ${s} not found`);
    return this.connections.splice(t, 1), this;
  }
  setContext(s, t) {
    return this.context[s] = t, this;
  }
  getContext(s) {
    return this.context[s];
  }
  clearContext() {
    return this.context = {}, this;
  }
  findSourceNodes() {
    const s = new Set(this.connections.map((t) => t.targetNodeId));
    return Array.from(this.nodes.keys()).filter((t) => !s.has(t));
  }
  findReadyNodes(s) {
    const t = [];
    for (const [e, r] of this.nodes.entries()) {
      if (s.has(e)) continue;
      this.connections.filter((n) => n.targetNodeId === e).every((n) => s.has(n.sourceNodeId)) && t.push(e);
    }
    return t;
  }
  async executeNode(s, t = {}) {
    const e = this.nodes.get(s);
    if (!e)
      throw new Error(`Node with id ${s} not found`);
    try {
      if (typeof e.load == "function")
        return await e.load();
      if (typeof e.process == "function")
        return await e.process(t);
      throw new Error(`Node ${s} has no executable method`);
    } catch (r) {
      throw e.error = r.message, e.status = "error", r;
    }
  }
  async execute() {
    if (this.status === "running")
      throw new Error("Runtime is already running");
    this.setStatus("running"), this.error = null, this.executedNodes = /* @__PURE__ */ new Set(), this.pauseRequested = !1;
    try {
      const s = this.findSourceNodes();
      if (s.length === 0)
        throw new Error("No source nodes found in the dataflow");
      for (this.executionQueue = [...s]; this.executionQueue.length > 0 && !this.pauseRequested; ) {
        const e = this.executionQueue.shift(), r = this.nodes.get(e);
        if (!r || this.executedNodes.has(e)) continue;
        const h = {}, m = this.connections.filter((n) => n.targetNodeId === e);
        for (const n of m) {
          const p = this.nodes.get(n.sourceNodeId);
          if (!p)
            throw new Error(`Source node ${n.sourceNodeId} not found`);
          const f = n.outputName === "output" ? p.output : p[n.outputName];
          h[n.inputName] = f;
        }
        r.status = "running";
        try {
          const n = await this.executeNode(e, h);
          r.output = n, r.status = "completed", this.executedNodes.add(e);
          const p = this.connections.filter((c) => c.sourceNodeId === e);
          for (const c of p)
            !this.executionQueue.includes(c.targetNodeId) && !this.executedNodes.has(c.targetNodeId) && this.executionQueue.push(c.targetNodeId);
          const f = this.findReadyNodes(this.executedNodes);
          for (const c of f)
            !this.executionQueue.includes(c) && !this.executedNodes.has(c) && this.executionQueue.push(c);
        } catch (n) {
          if (r.status = "error", r.error = n.message, this.context.strictMode)
            throw n;
        }
      }
      if (this.pauseRequested) {
        this.setStatus("paused");
        const e = {
          status: "paused",
          executedNodes: Array.from(this.executedNodes),
          pendingNodes: this.executionQueue,
          context: this.context
        };
        return this.onExecutionComplete && this.onExecutionComplete(e), e;
      }
      this.setStatus("completed");
      const t = {
        status: "completed",
        executedNodes: Array.from(this.executedNodes),
        outputs: {},
        context: this.context
      };
      for (const [e, r] of this.nodes.entries())
        r.output !== void 0 && (t.outputs[e] = r.output);
      return this.onExecutionComplete && this.onExecutionComplete(t), t;
    } catch (s) {
      this.setStatus("error"), this.error = s.message;
      const t = {
        status: "error",
        error: s.message,
        executedNodes: Array.from(this.executedNodes),
        context: this.context
      };
      return this.onExecutionComplete && this.onExecutionComplete(t), t;
    }
  }
  pause() {
    if (this.status !== "running")
      throw new Error("Runtime is not running");
    return this.pauseRequested = !0, this;
  }
  async resume() {
    if (this.status !== "paused")
      throw new Error("Runtime is not paused");
    return this.pauseRequested = !1, this.execute();
  }
  stop() {
    if (this.status !== "running" && this.status !== "paused")
      throw new Error("Runtime is not running or paused");
    return this.executionQueue = [], this.setStatus("stopped"), this;
  }
  reset() {
    this.executionQueue = [], this.executedNodes = /* @__PURE__ */ new Set(), this.pauseRequested = !1, this.error = null, this.setStatus("idle");
    for (const s of this.nodes.values())
      s.status = "idle", s.error = null, s.output = null, s.inputs && (s.inputs = {});
    return this;
  }
  setStatus(s) {
    return this.status = s, this.onStatusChange && this.onStatusChange(s), this;
  }
  getState() {
    const s = {};
    for (const [t, e] of this.nodes.entries())
      s[t] = {
        id: e.id,
        alias: e.alias,
        type: e.type,
        status: e.status,
        error: e.error
      };
    return {
      status: this.status,
      error: this.error,
      nodes: s,
      connections: this.connections,
      context: this.context,
      executedNodes: Array.from(this.executedNodes),
      pendingNodes: this.executionQueue
    };
  }
  loadDefinition(s) {
    if (this.reset(), this.nodes.clear(), this.connections = [], s.context && (this.context = { ...s.context }), s.nodes && Array.isArray(s.nodes))
      for (const t of s.nodes) {
        const e = {
          id: t.id,
          alias: t.alias || t.id,
          type: t.type,
          status: "idle",
          error: null,
          output: null,
          ...t.properties
        };
        this.nodes.set(e.id, e);
      }
    return s.connections && Array.isArray(s.connections) && (this.connections = [...s.connections]), this;
  }
  exportDefinition() {
    const s = [];
    for (const [t, e] of this.nodes.entries()) {
      const r = {
        id: e.id,
        alias: e.alias,
        type: e.type,
        properties: {}
      };
      for (const [h, m] of Object.entries(e))
        ["id", "alias", "type", "status", "error", "output", "inputs"].includes(h) || (r.properties[h] = m);
      s.push(r);
    }
    return {
      nodes: s,
      connections: this.connections,
      context: this.context,
      name: "Flow Definition",
      description: "Exported flow definition"
    };
  }
}
class xt {
  /**
   * Create a new FlowManager
   * @param storage Storage implementation to use
   */
  constructor(s) {
    o(this, "storage");
    this.storage = s;
  }
  /**
   * Save a flow definition
   * @param id Flow ID
   * @param definition Flow definition
   * @returns Promise resolving to the saved flow definition
   */
  async saveFlow(s, t) {
    const e = {
      ...t,
      id: s,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return e.createdAt || (e.createdAt = e.updatedAt), await this.storage.saveItem(`flow:${s}`, e), e;
  }
  /**
   * Get a flow definition
   * @param id Flow ID
   * @returns Promise resolving to the flow definition or null if not found
   */
  async getFlow(s) {
    return this.storage.getItem(`flow:${s}`);
  }
  /**
   * Delete a flow definition
   * @param id Flow ID
   * @returns Promise resolving to true if the flow was deleted, false otherwise
   */
  async deleteFlow(s) {
    return this.storage.removeItem(`flow:${s}`);
  }
  /**
   * List all flow definitions
   * @returns Promise resolving to an array of flow definitions
   */
  async listFlows() {
    return (await this.storage.listItems()).filter((t) => t.key.startsWith("flow:")).map((t) => t.value);
  }
  /**
   * Clone a flow definition
   * @param sourceId Source flow ID
   * @param targetId Target flow ID
   * @param newName Optional new name for the cloned flow
   * @returns Promise resolving to the cloned flow definition
   */
  async cloneFlow(s, t, e) {
    const r = await this.getFlow(s);
    if (!r)
      return null;
    const h = {
      ...r,
      name: e || `${r.name} (Clone)`,
      createdAt: void 0,
      updatedAt: void 0
    };
    return this.saveFlow(t, h);
  }
  /**
   * Update a flow definition partially
   * @param id Flow ID
   * @param updates Partial flow definition updates
   * @returns Promise resolving to the updated flow definition
   */
  async updateFlow(s, t) {
    const e = await this.getFlow(s);
    if (!e)
      return null;
    const r = {
      ...e,
      ...t
      // id: undefined // Remove id as it will be added by saveFlow
    };
    return this.saveFlow(s, r);
  }
  /**
   * Check if a flow exists
   * @param id Flow ID
   * @returns Promise resolving to true if the flow exists, false otherwise
   */
  async flowExists(s) {
    return await this.getFlow(s) !== null;
  }
  /**
   * Search for flows by name or description
   * @param query Search query
   * @returns Promise resolving to an array of matching flow definitions
   */
  async searchFlows(s) {
    const t = await this.listFlows(), e = s.toLowerCase();
    return t.filter(
      (r) => r.name.toLowerCase().includes(e) || r.description && r.description.toLowerCase().includes(e)
    );
  }
  /**
   * Get the storage implementation
   * @returns The storage implementation
   */
  getStorage() {
    return this.storage;
  }
  /**
   * Set a new storage implementation
   * @param storage New storage implementation
   */
  setStorage(s) {
    this.storage = s;
  }
}
class Nt {
  constructor() {
    o(this, "items");
    this.items = /* @__PURE__ */ new Map();
  }
  /**
   * Save an item
   * @param key Item key
   * @param value Item value
   * @returns Promise resolving to the saved value
   */
  async saveItem(s, t) {
    return this.items.set(s, t), t;
  }
  /**
   * Get an item
   * @param key Item key
   * @returns Promise resolving to the item value or null if not found
   */
  async getItem(s) {
    return this.items.get(s) || null;
  }
  /**
   * Remove an item
   * @param key Item key
   * @returns Promise resolving to true if the item was removed, false otherwise
   */
  async removeItem(s) {
    return this.items.delete(s);
  }
  /**
   * List all items
   * @returns Promise resolving to an array of items
   */
  async listItems() {
    return Array.from(this.items.entries()).map(([s, t]) => ({ key: s, value: t }));
  }
  /**
   * Clear all items
   * @returns Promise resolving when all items are cleared
   */
  async clear() {
    this.items.clear();
  }
  /**
   * Get the number of items
   * @returns Promise resolving to the number of items
   */
  async size() {
    return this.items.size;
  }
  /**
   * Check if an item exists
   * @param key Item key
   * @returns Promise resolving to true if the item exists, false otherwise
   */
  async hasItem(s) {
    return this.items.has(s);
  }
}
class a {
  constructor(s, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "inputs");
    o(this, "output");
    o(this, "status");
    o(this, "error");
    this.id = s, this.alias = t || s, this.type = "action", this.inputs = {}, this.output = null, this.status = "idle", this.error = null;
  }
  setInput(s, t) {
    this.inputs[s] = t;
  }
}
async function w(i, s, t) {
  const e = [];
  if (s && s.required)
    for (const r of s.required)
      r in i || e.push(`Missing required field: ${r}`);
  if (s && s.properties)
    for (const [r, h] of Object.entries(s.properties))
      r in i && typeof i[r] !== h.type && e.push(`Field ${r} should be of type ${h.type}`);
  return {
    valid: e.length === 0,
    errors: e
  };
}
function l(i) {
  return new Promise((s, t) => {
    setTimeout(() => {
      i ? s('{"key": "value", "example": 123}') : t(new Error("File path is empty"));
    }, 100);
  });
}
class x extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "schema");
    o(this, "strictMode");
    this.type = "json-validator", this.schema = r.schema || {}, this.strictMode = r.strictMode !== !1;
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.data;
      if (!e)
        throw new Error("No input data provided");
      const r = await w(e, this.schema, this.strictMode);
      if (r.valid)
        this.output = {
          data: e,
          valid: !0,
          errors: []
        };
      else {
        if (this.strictMode)
          throw new Error(`JSON validation failed: ${r.errors.join(", ")}`);
        this.output = {
          data: e,
          valid: !1,
          errors: r.errors
        };
      }
      return this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class N extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "script");
    this.type = "custom-script", this.script = r.script || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.script)
        throw new Error("No script provided");
      return console.log(`Executing script: ${this.script}`), this.output = { result: `Simulated execution of script: ${this.script}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class S extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "command");
    this.type = "ai-command", this.command = r.command || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.command)
        throw new Error("No AI command provided");
      return console.log(`Executing AI command: ${this.command}`), this.output = { result: `Simulated execution of AI command: ${this.command}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class v extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "transformationType");
    this.type = "ai-text-transform", this.transformationType = r.transformationType || "default";
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.text;
      if (!e)
        throw new Error("No input text provided");
      return console.log(`Transforming text with type: ${this.transformationType}`), this.output = { result: `Simulated transformation of text: ${e}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class E extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "prompt");
    this.type = "ai-image-gen", this.prompt = r.prompt || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.prompt)
        throw new Error("No prompt provided for image generation");
      return console.log(`Generating image with prompt: ${this.prompt}`), this.output = { result: `Simulated image generation for prompt: ${this.prompt}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class $ extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "prompt");
    this.type = "ai-video-gen", this.prompt = r.prompt || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.prompt)
        throw new Error("No prompt provided for video generation");
      return console.log(`Generating video with prompt: ${this.prompt}`), this.output = { result: `Simulated video generation for prompt: ${this.prompt}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class T extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "language");
    this.type = "audio-transcribe", this.language = r.language || "en";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.audio)
        throw new Error("No audio input provided");
      return console.log(`Transcribing audio in language: ${this.language}`), this.output = { result: `Simulated transcription of audio in ${this.language}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class P extends a {
  constructor(s, t) {
    super(s, t), this.type = "audio-noise-reduction";
  }
  async process(s) {
    try {
      if (this.status = "running", !s.audio)
        throw new Error("No audio input provided");
      return console.log("Reducing noise in audio"), this.output = { result: "Simulated noise-reduced audio" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class C extends a {
  constructor(s, t) {
    super(s, t), this.type = "audio-mix";
  }
  async process(s) {
    try {
      this.status = "running";
      const t = s.tracks;
      if (!t || !Array.isArray(t))
        throw new Error("No audio tracks provided for mixing");
      return console.log("Mixing audio tracks"), this.output = { result: "Simulated mixed audio" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class b extends a {
  constructor(s, t) {
    super(s, t), this.type = "video-compose";
  }
  async process(s) {
    try {
      this.status = "running";
      const t = s.clips;
      if (!t || !Array.isArray(t))
        throw new Error("No video clips provided for composition");
      return console.log("Composing video clips"), this.output = { result: "Simulated composed video" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class A extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "apiKey");
    this.type = "youtube-uploader", this.apiKey = r.apiKey || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.video)
        throw new Error("No video input provided for upload");
      if (!this.apiKey)
        throw new Error("No API key provided for YouTube upload");
      return console.log(`Uploading video to YouTube with API key: ${this.apiKey}`), this.output = { result: "Simulated YouTube video upload" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class F extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "xslt");
    this.type = "xml-transformer", this.xslt = r.xslt || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.xml)
        throw new Error("No XML input provided");
      if (!this.xslt)
        throw new Error("No XSLT provided for transformation");
      return console.log(`Transforming XML with XSLT: ${this.xslt}`), this.output = { result: `Simulated transformation of XML with XSLT: ${this.xslt}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class R extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "format");
    this.type = "video-transcoder", this.format = r.format || "mp4";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.video)
        throw new Error("No video input provided");
      return console.log(`Transcoding video to format: ${this.format}`), this.output = { result: `Simulated transcoded video to format: ${this.format}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class q extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "analysisType");
    this.type = "text-analyzer", this.analysisType = r.analysisType || "sentiment";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.text)
        throw new Error("No text input provided");
      return console.log(`Analyzing text with type: ${this.analysisType}`), this.output = { result: `Simulated text analysis of type: ${this.analysisType}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class I extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "template");
    this.type = "template-renderer", this.template = r.template || "";
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.data;
      if (!e)
        throw new Error("No data provided for template rendering");
      if (!this.template)
        throw new Error("No template provided");
      return console.log(`Rendering template with data: ${JSON.stringify(e)}`), this.output = { result: `Simulated rendered template with data: ${JSON.stringify(e)}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class D extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "scheduleTime");
    this.type = "scheduler", this.scheduleTime = r.scheduleTime || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.scheduleTime)
        throw new Error("No schedule time provided");
      return console.log(`Scheduling task at: ${this.scheduleTime}`), this.output = { result: `Simulated task scheduled at: ${this.scheduleTime}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class k extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "notificationConfig");
    this.type = "notification-sender", this.notificationConfig = r.notificationConfig || {};
  }
  async process(t) {
    try {
      if (this.status = "running", !t.message)
        throw new Error("No message provided for notification");
      return console.log("Sending notification with config:", this.notificationConfig), this.output = { result: "Simulated notification sent" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class M extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "modelPath");
    this.type = "ml-predictor", this.modelPath = r.modelPath || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.data)
        throw new Error("No input data provided for prediction");
      if (!this.modelPath)
        throw new Error("No model path provided");
      return console.log(`Making prediction using model at: ${this.modelPath}`), this.output = { result: "Simulated ML prediction result" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class L extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "transformation");
    this.type = "image-processor", this.transformation = r.transformation || "resize";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.image)
        throw new Error("No image input provided");
      return console.log(`Processing image with transformation: ${this.transformation}`), this.output = { result: `Simulated image processing with transformation: ${this.transformation}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class j extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "url");
    o(this, "method");
    this.type = "http-request", this.url = r.url || "", this.method = r.method || "GET";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.url)
        throw new Error("No URL provided for HTTP request");
      return console.log(`Making ${this.method} request to URL: ${this.url}`), this.output = { result: `Simulated ${this.method} request to ${this.url}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class Q extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    this.type = "file-writer", this.filePath = r.filePath || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.data)
        throw new Error("No data provided for writing to file");
      if (!this.filePath)
        throw new Error("No file path provided");
      return console.log(`Writing data to file: ${this.filePath}`), this.output = { result: `Simulated writing data to file: ${this.filePath}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class O extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "emailConfig");
    this.type = "email-sender", this.emailConfig = r.emailConfig || {};
  }
  async process(t) {
    try {
      if (this.status = "running", !t.emailData)
        throw new Error("No email data provided");
      return console.log("Sending email with config:", this.emailConfig), this.output = { result: "Simulated email sent" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class K extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "validationRules");
    this.type = "data-validator", this.validationRules = r.validationRules || {};
  }
  async process(t) {
    try {
      if (this.status = "running", !t.data)
        throw new Error("No data provided for validation");
      if (!this.validationRules)
        throw new Error("No validation rules provided");
      return console.log("Validating data with rules:", this.validationRules), this.output = { result: "Simulated data validation result" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class _ extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "mappingRules");
    this.type = "data-mapper", this.mappingRules = r.mappingRules || {};
  }
  async process(t) {
    try {
      if (this.status = "running", !t.data)
        throw new Error("No data provided for mapping");
      if (!this.mappingRules)
        throw new Error("No mapping rules provided");
      return console.log("Mapping data with rules:", this.mappingRules), this.output = { result: "Simulated mapped data" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class G extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "joinKey");
    this.type = "data-joiner", this.joinKey = r.joinKey || "";
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.dataSources;
      if (!e || !Array.isArray(e))
        throw new Error("No data sources provided for joining");
      if (!this.joinKey)
        throw new Error("No join key provided");
      return console.log(`Joining data sources with key: ${this.joinKey}`), this.output = { result: "Simulated joined data" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class U extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filterCondition");
    this.type = "data-filter", this.filterCondition = r.filterCondition || "";
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.data;
      if (!e || !Array.isArray(e))
        throw new Error("No data provided for filtering");
      if (!this.filterCondition)
        throw new Error("No filter condition provided");
      return console.log(`Filtering data with condition: ${this.filterCondition}`), this.output = { result: `Simulated filtered data with condition: ${this.filterCondition}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class W extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "connectionString");
    this.type = "database-writer", this.connectionString = r.connectionString || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.data)
        throw new Error("No data provided for database writing");
      if (!this.connectionString)
        throw new Error("No database connection string provided");
      return console.log(`Writing data to database with connection string: ${this.connectionString}`), this.output = { result: "Simulated database write operation" }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class J extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "aggregationType");
    this.type = "data-aggregator", this.aggregationType = r.aggregationType || "sum";
  }
  async process(t) {
    try {
      this.status = "running";
      const e = t.dataSources;
      if (!e || !Array.isArray(e))
        throw new Error("No data sources provided for aggregation");
      return console.log(`Aggregating data with type: ${this.aggregationType}`), this.output = { result: `Simulated data aggregation of type: ${this.aggregationType}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class V extends a {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "condition");
    this.type = "conditional-branch", this.condition = r.condition || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.condition)
        throw new Error("No condition provided for branching");
      console.log(`Evaluating condition: ${this.condition}`);
      const e = Math.random() > 0.5 ? "true" : "false";
      return this.output = { result: `Simulated branch: ${e}` }, this.status = "completed", this.output;
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
const St = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AICommand: S,
  AIImageGen: E,
  AITextTransform: v,
  AIVideoGen: $,
  AudioMix: C,
  AudioNoiseReduction: P,
  AudioTranscribe: T,
  BaseActionNode: a,
  ConditionalBranch: V,
  CustomScriptNode: N,
  DataAggregator: J,
  DataFilter: U,
  DataJoiner: G,
  DataMapper: _,
  DataValidator: K,
  DatabaseWriter: W,
  EmailSender: O,
  FileWriter: Q,
  HTTPRequest: j,
  ImageProcessor: L,
  JSONValidatorNode: x,
  MLPredictor: M,
  NotificationSender: k,
  Scheduler: D,
  TemplateRenderer: I,
  TextAnalyzer: q,
  VideoCompose: b,
  VideoTranscoder: R,
  XMLTransformer: F,
  YouTubeUploader: A
}, Symbol.toStringTag, { value: "Module" }));
class u {
  constructor(s, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "data");
    o(this, "status");
    o(this, "error");
    this.id = s, this.alias = t || s, this.type = "data", this.data = {}, this.status = "idle", this.error = null;
  }
  getDataByPath(s) {
    if (!s) return this.data;
    const t = s.split(".");
    let e = this.data;
    for (const r of t) {
      if (e == null) return;
      e = e[r];
    }
    return e;
  }
}
class z extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    o(this, "schema");
    this.type = "json-file", this.filePath = r.filePath || "", this.schema = r.schema || null;
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = JSON.parse(t), this.schema, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class X extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    this.type = "xml-file", this.filePath = r.filePath || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class B extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    o(this, "delimiter");
    this.type = "csv-file", this.filePath = r.filePath || "", this.delimiter = r.delimiter || ",";
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = t.split(this.delimiter), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class Y extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    this.type = "video-file", this.filePath = r.filePath || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class H extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    this.type = "audio-file", this.filePath = r.filePath || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class Z extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "filePath");
    this.type = "image-file", this.filePath = r.filePath || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.filePath)
        throw new Error("File path not specified");
      const t = await l(this.filePath);
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class tt extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "connectionString");
    o(this, "query");
    this.type = "sql-database", this.connectionString = r.connectionString || "", this.query = r.query || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.connectionString || !this.query)
        throw new Error("Connection string or query not specified");
      return this.data = await this.simulateQueryExecution(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateQueryExecution() {
    return { result: `Simulated result for query: ${this.query}` };
  }
}
class et extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "connectionString");
    o(this, "collection");
    o(this, "query");
    this.type = "nosql-database", this.connectionString = r.connectionString || "", this.collection = r.collection || "", this.query = r.query || {};
  }
  async load() {
    try {
      if (this.status = "running", !this.connectionString || !this.collection)
        throw new Error("Connection string or collection not specified");
      return this.data = await this.simulateQueryExecution(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateQueryExecution() {
    return { result: `Simulated result for collection: ${this.collection}` };
  }
}
class st extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "url");
    o(this, "method");
    o(this, "headers");
    o(this, "body");
    this.type = "rest-api", this.url = r.url || "", this.method = r.method || "GET", this.headers = r.headers || {}, this.body = r.body || null;
  }
  async load() {
    try {
      if (this.status = "running", !this.url)
        throw new Error("URL not specified");
      const t = await this.simulateAPIRequest();
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateAPIRequest() {
    return { result: `Simulated response from ${this.url}` };
  }
}
class rt extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "url");
    o(this, "query");
    o(this, "variables");
    this.type = "graphql-api", this.url = r.url || "", this.query = r.query || "", this.variables = r.parameters || {};
  }
  async load() {
    try {
      if (this.status = "running", !this.url || !this.query)
        throw new Error("URL or query not specified");
      const t = await this.simulateGraphQLRequest();
      return this.data = t, this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateGraphQLRequest() {
    return { result: `Simulated response for query: ${this.query}` };
  }
}
class ot extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "url");
    o(this, "protocol");
    this.type = "websocket", this.url = r.url || "", this.protocol = r.protocol || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.url)
        throw new Error("WebSocket URL not specified");
      return this.data = await this.simulateWebSocketConnection(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateWebSocketConnection() {
    return { result: `Simulated WebSocket connection to ${this.url}` };
  }
}
class it extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "formData");
    this.type = "form-data", this.formData = r.formData || {};
  }
  async load() {
    try {
      if (this.status = "running", !this.formData || Object.keys(this.formData).length === 0)
        throw new Error("Form data not specified");
      return this.data = await this.simulateFormDataProcessing(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateFormDataProcessing() {
    return { result: `Simulated form data: ${JSON.stringify(this.formData)}` };
  }
}
class at extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "url");
    this.type = "rss-feed", this.url = r.url || "";
  }
  async load() {
    try {
      if (this.status = "running", !this.url)
        throw new Error("RSS feed URL not specified");
      return this.data = await this.simulateRSSFeedFetch(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateRSSFeedFetch() {
    return { result: `Simulated RSS feed data from ${this.url}` };
  }
}
class nt extends u {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "server");
    o(this, "username");
    o(this, "password");
    o(this, "folder");
    this.type = "email-source", this.server = r.server || "", this.username = r.username || "", this.password = r.password || "", this.folder = r.folder || "INBOX";
  }
  async load() {
    try {
      if (this.status = "running", !this.server || !this.username || !this.password)
        throw new Error("Email server credentials not specified");
      return this.data = await this.simulateEmailFetch(), this.status = "completed", this.data;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
  async simulateEmailFetch() {
    return { result: `Simulated emails from folder: ${this.folder}` };
  }
}
const vt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AudioFileNode: H,
  BaseDataNode: u,
  CSVFileNode: B,
  EmailSourceNode: nt,
  FormDataNode: it,
  GraphQLAPINode: rt,
  ImageFileNode: Z,
  JSONFileNode: z,
  NoSQLDatabaseNode: et,
  RESTAPINode: st,
  RSSFeedNode: at,
  SQLDatabaseNode: tt,
  VideoFileNode: Y,
  WebSocketNode: ot,
  XMLFileNode: X
}, Symbol.toStringTag, { value: "Module" }));
class d {
  constructor(s, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "inputs");
    o(this, "status");
    o(this, "error");
    this.id = s, this.alias = t || s, this.type = "sink", this.inputs = {}, this.status = "idle", this.error = null;
  }
  setInput(s, t) {
    this.inputs[s] = t;
  }
}
class ut extends d {
  constructor(s, t) {
    super(s, t), this.type = "output-log";
  }
  async process(s) {
    try {
      this.status = "running", console.log("OutputLogNode:", s), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class ht extends d {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "server");
    o(this, "username");
    o(this, "password");
    o(this, "from");
    o(this, "to");
    o(this, "subject");
    o(this, "isHtml");
    this.type = "send-email", this.server = r.server || "", this.username = r.username || "", this.password = r.password || "", this.from = r.from || "", this.to = r.to || "", this.subject = r.subject || "", this.isHtml = r.isHtml || !1;
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated email sent to ${this.to}`), this.status = "completed";
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class ct extends d {
  constructor(s, t) {
    super(s, t), this.type = "send-push-notification";
  }
  async process(s) {
    try {
      this.status = "running", console.log("Simulated push notification:", s), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class dt extends d {
  constructor(s, t) {
    super(s, t), this.type = "media-viewer";
  }
  async process(s) {
    try {
      this.status = "running", console.log("Simulated media viewer:", s), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class lt extends d {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "apiKey");
    o(this, "videoTitle");
    o(this, "videoDescription");
    this.type = "upload-to-youtube", this.apiKey = r.apiKey || "", this.videoTitle = r.videoTitle || "", this.videoDescription = r.videoDescription || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to YouTube: ${this.videoTitle}`), this.status = "completed";
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class pt extends d {
  constructor(s, t) {
    super(s, t), this.type = "upload-to-google-drive";
  }
  async process(s) {
    try {
      this.status = "running", console.log("Simulated upload to Google Drive:", s), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class mt extends d {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "bucketName");
    o(this, "accessKey");
    o(this, "secretKey");
    this.type = "upload-to-s3", this.bucketName = r.bucketName || "", this.accessKey = r.accessKey || "", this.secretKey = r.secretKey || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to S3 bucket: ${this.bucketName}`), this.status = "completed";
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
class ft extends d {
  constructor(t, e, r = {}) {
    super(t, e);
    o(this, "server");
    o(this, "username");
    o(this, "password");
    this.type = "upload-to-ftp", this.server = r.server || "", this.username = r.username || "", this.password = r.password || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to FTP server: ${this.server}`), this.status = "completed";
    } catch (e) {
      throw this.status = "error", this.error = e.message, e;
    }
  }
}
const Et = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaseSinkNode: d,
  MediaViewerNode: dt,
  OutputLogNode: ut,
  SendEmailNode: ht,
  SendPushNotificationNode: ct,
  UploadFTPNode: ft,
  UploadGGDriveNode: pt,
  UploadS3Node: mt,
  UploadToYoutubeNode: lt
}, Symbol.toStringTag, { value: "Module" }));
export {
  xt as FlowManager,
  Nt as MemoryStorage,
  yt as NodeFactory,
  wt as Runtime,
  St as actionNodes,
  vt as dataSourceNodes,
  Et as sinkNodes
};
