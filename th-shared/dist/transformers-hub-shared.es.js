var y = Object.defineProperty;
var g = (i, e, t) => e in i ? y(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var o = (i, e, t) => g(i, typeof e != "symbol" ? e + "" : e, t);
class Y {
  constructor() {
    o(this, "nodeTypes");
    this.nodeTypes = /* @__PURE__ */ new Map();
  }
  /**
   * Register a node type
   * @param type Node type name
   * @param constructor Node constructor
   */
  registerNodeType(e, t) {
    return this.nodeTypes.set(e, t), this;
  }
  /**
   * Create a node instance
   * @param type Node type name
   * @param id Node ID
   * @param alias Node alias
   * @param options Node options
   * @returns Node instance
   */
  createNode(e, t, s, r = {}) {
    const u = this.nodeTypes.get(e);
    if (!u)
      throw new Error(`Node type ${e} not registered`);
    return new u(t, s, r);
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
  hasNodeType(e) {
    return this.nodeTypes.has(e);
  }
}
class Z {
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
  registerNode(e) {
    if (!e.id)
      throw new Error("Node must have an id");
    if (this.nodes.set(e.id, e), this.onNodeStatusChange) {
      const t = e.status;
      e.status = (s) => {
        typeof t == "function" && t.call(e, s), this.onNodeStatusChange(e.id, s);
      };
    }
    return this;
  }
  registerNodes(e) {
    if (!Array.isArray(e))
      throw new Error("Nodes must be an array");
    for (const t of e)
      this.registerNode(t);
    return this;
  }
  removeNode(e) {
    if (!this.nodes.has(e))
      throw new Error(`Node with id ${e} not found`);
    return this.nodes.delete(e), this.connections = this.connections.filter(
      (t) => t.sourceNodeId !== e && t.targetNodeId !== e
    ), this;
  }
  addConnection(e, t, s = "output", r = "data") {
    if (!this.nodes.has(e))
      throw new Error(`Source node with id ${e} not found`);
    if (!this.nodes.has(t))
      throw new Error(`Target node with id ${t} not found`);
    return this.connections.push({
      id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sourceNodeId: e,
      targetNodeId: t,
      outputName: s,
      inputName: r
    }), this;
  }
  removeConnection(e) {
    const t = this.connections.findIndex((s) => s.id === e);
    if (t === -1)
      throw new Error(`Connection with id ${e} not found`);
    return this.connections.splice(t, 1), this;
  }
  setContext(e, t) {
    return this.context[e] = t, this;
  }
  getContext(e) {
    return this.context[e];
  }
  clearContext() {
    return this.context = {}, this;
  }
  findSourceNodes() {
    const e = new Set(this.connections.map((t) => t.targetNodeId));
    return Array.from(this.nodes.keys()).filter((t) => !e.has(t));
  }
  findReadyNodes(e) {
    const t = [];
    for (const [s, r] of this.nodes.entries()) {
      if (e.has(s)) continue;
      this.connections.filter((n) => n.targetNodeId === s).every((n) => e.has(n.sourceNodeId)) && t.push(s);
    }
    return t;
  }
  async executeNode(e, t = {}) {
    const s = this.nodes.get(e);
    if (!s)
      throw new Error(`Node with id ${e} not found`);
    try {
      if (typeof s.load == "function")
        return await s.load();
      if (typeof s.process == "function")
        return await s.process(t);
      throw new Error(`Node ${e} has no executable method`);
    } catch (r) {
      throw s.error = r.message, s.status = "error", r;
    }
  }
  async execute() {
    if (this.status === "running")
      throw new Error("Runtime is already running");
    this.setStatus("running"), this.error = null, this.executedNodes = /* @__PURE__ */ new Set(), this.pauseRequested = !1;
    try {
      const e = this.findSourceNodes();
      if (e.length === 0)
        throw new Error("No source nodes found in the dataflow");
      for (this.executionQueue = [...e]; this.executionQueue.length > 0 && !this.pauseRequested; ) {
        const s = this.executionQueue.shift(), r = this.nodes.get(s);
        if (!r || this.executedNodes.has(s)) continue;
        const u = {}, m = this.connections.filter((n) => n.targetNodeId === s);
        for (const n of m) {
          const p = this.nodes.get(n.sourceNodeId);
          if (!p)
            throw new Error(`Source node ${n.sourceNodeId} not found`);
          const f = n.outputName === "output" ? p.output : p[n.outputName];
          u[n.inputName] = f;
        }
        r.status = "running";
        try {
          const n = await this.executeNode(s, u);
          r.output = n, r.status = "completed", this.executedNodes.add(s);
          const p = this.connections.filter((c) => c.sourceNodeId === s);
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
        const s = {
          status: "paused",
          executedNodes: Array.from(this.executedNodes),
          pendingNodes: this.executionQueue,
          context: this.context
        };
        return this.onExecutionComplete && this.onExecutionComplete(s), s;
      }
      this.setStatus("completed");
      const t = {
        status: "completed",
        executedNodes: Array.from(this.executedNodes),
        outputs: {},
        context: this.context
      };
      for (const [s, r] of this.nodes.entries())
        r.output !== void 0 && (t.outputs[s] = r.output);
      return this.onExecutionComplete && this.onExecutionComplete(t), t;
    } catch (e) {
      this.setStatus("error"), this.error = e.message;
      const t = {
        status: "error",
        error: e.message,
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
    for (const e of this.nodes.values())
      e.status = "idle", e.error = null, e.output = null, e.inputs && (e.inputs = {});
    return this;
  }
  setStatus(e) {
    return this.status = e, this.onStatusChange && this.onStatusChange(e), this;
  }
  getState() {
    const e = {};
    for (const [t, s] of this.nodes.entries())
      e[t] = {
        id: s.id,
        alias: s.alias,
        type: s.type,
        status: s.status,
        error: s.error
      };
    return {
      status: this.status,
      error: this.error,
      nodes: e,
      connections: this.connections,
      context: this.context,
      executedNodes: Array.from(this.executedNodes),
      pendingNodes: this.executionQueue
    };
  }
  loadDefinition(e) {
    if (this.reset(), this.nodes.clear(), this.connections = [], e.context && (this.context = { ...e.context }), e.nodes && Array.isArray(e.nodes))
      for (const t of e.nodes) {
        const s = {
          id: t.id,
          alias: t.alias || t.id,
          type: t.type,
          status: "idle",
          error: null,
          output: null,
          ...t.properties
        };
        this.nodes.set(s.id, s);
      }
    return e.connections && Array.isArray(e.connections) && (this.connections = [...e.connections]), this;
  }
  exportDefinition() {
    const e = [];
    for (const [t, s] of this.nodes.entries()) {
      const r = {
        id: s.id,
        alias: s.alias,
        type: s.type,
        properties: {}
      };
      for (const [u, m] of Object.entries(s))
        ["id", "alias", "type", "status", "error", "output", "inputs"].includes(u) || (r.properties[u] = m);
      e.push(r);
    }
    return {
      nodes: e,
      connections: this.connections,
      context: this.context,
      name: "Flow Definition",
      description: "Exported flow definition"
    };
  }
}
class tt {
  /**
   * Create a new FlowManager
   * @param storage Storage implementation to use
   */
  constructor(e) {
    o(this, "storage");
    this.storage = e;
  }
  /**
   * Save a flow definition
   * @param id Flow ID
   * @param definition Flow definition
   * @returns Promise resolving to the saved flow definition
   */
  async saveFlow(e, t) {
    const s = {
      ...t,
      id: e,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return s.createdAt || (s.createdAt = s.updatedAt), await this.storage.saveItem(`flow:${e}`, s), s;
  }
  /**
   * Get a flow definition
   * @param id Flow ID
   * @returns Promise resolving to the flow definition or null if not found
   */
  async getFlow(e) {
    return this.storage.getItem(`flow:${e}`);
  }
  /**
   * Delete a flow definition
   * @param id Flow ID
   * @returns Promise resolving to true if the flow was deleted, false otherwise
   */
  async deleteFlow(e) {
    return this.storage.removeItem(`flow:${e}`);
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
  async cloneFlow(e, t, s) {
    const r = await this.getFlow(e);
    if (!r)
      return null;
    const u = {
      ...r,
      name: s || `${r.name} (Clone)`,
      createdAt: void 0,
      updatedAt: void 0
    };
    return this.saveFlow(t, u);
  }
  /**
   * Update a flow definition partially
   * @param id Flow ID
   * @param updates Partial flow definition updates
   * @returns Promise resolving to the updated flow definition
   */
  async updateFlow(e, t) {
    const s = await this.getFlow(e);
    if (!s)
      return null;
    const r = {
      ...s,
      ...t
      // id: undefined // Remove id as it will be added by saveFlow
    };
    return this.saveFlow(e, r);
  }
  /**
   * Check if a flow exists
   * @param id Flow ID
   * @returns Promise resolving to true if the flow exists, false otherwise
   */
  async flowExists(e) {
    return await this.getFlow(e) !== null;
  }
  /**
   * Search for flows by name or description
   * @param query Search query
   * @returns Promise resolving to an array of matching flow definitions
   */
  async searchFlows(e) {
    const t = await this.listFlows(), s = e.toLowerCase();
    return t.filter(
      (r) => r.name.toLowerCase().includes(s) || r.description && r.description.toLowerCase().includes(s)
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
  setStorage(e) {
    this.storage = e;
  }
}
class et {
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
  async saveItem(e, t) {
    return this.items.set(e, t), t;
  }
  /**
   * Get an item
   * @param key Item key
   * @returns Promise resolving to the item value or null if not found
   */
  async getItem(e) {
    return this.items.get(e) || null;
  }
  /**
   * Remove an item
   * @param key Item key
   * @returns Promise resolving to true if the item was removed, false otherwise
   */
  async removeItem(e) {
    return this.items.delete(e);
  }
  /**
   * List all items
   * @returns Promise resolving to an array of items
   */
  async listItems() {
    return Array.from(this.items.entries()).map(([e, t]) => ({ key: e, value: t }));
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
  async hasItem(e) {
    return this.items.has(e);
  }
}
class h {
  constructor(e, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "inputs");
    o(this, "output");
    o(this, "status");
    o(this, "error");
    this.id = e, this.alias = t || e, this.type = "action", this.inputs = {}, this.output = null, this.status = "idle", this.error = null;
  }
  setInput(e, t) {
    this.inputs[e] = t;
  }
}
async function w(i, e, t) {
  const s = [];
  if (e && e.required)
    for (const r of e.required)
      r in i || s.push(`Missing required field: ${r}`);
  if (e && e.properties)
    for (const [r, u] of Object.entries(e.properties))
      r in i && typeof i[r] !== u.type && s.push(`Field ${r} should be of type ${u.type}`);
  return {
    valid: s.length === 0,
    errors: s
  };
}
function l(i) {
  return new Promise((e, t) => {
    setTimeout(() => {
      i ? e('{"key": "value", "example": 123}') : t(new Error("File path is empty"));
    }, 100);
  });
}
class x extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "schema");
    o(this, "strictMode");
    this.type = "json-validator", this.schema = r.schema || {}, this.strictMode = r.strictMode !== !1;
  }
  async process(t) {
    try {
      this.status = "running";
      const s = t.data;
      if (!s)
        throw new Error("No input data provided");
      const r = await w(s, this.schema, this.strictMode);
      if (r.valid)
        this.output = {
          data: s,
          valid: !0,
          errors: []
        };
      else {
        if (this.strictMode)
          throw new Error(`JSON validation failed: ${r.errors.join(", ")}`);
        this.output = {
          data: s,
          valid: !1,
          errors: r.errors
        };
      }
      return this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class N extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "script");
    this.type = "custom-script", this.script = r.script || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.script)
        throw new Error("No script provided");
      return console.log(`Executing script: ${this.script}`), this.output = { result: `Simulated execution of script: ${this.script}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class S extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "command");
    this.type = "ai-command", this.command = r.command || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.command)
        throw new Error("No AI command provided");
      return console.log(`Executing AI command: ${this.command}`), this.output = { result: `Simulated execution of AI command: ${this.command}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class v extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "transformationType");
    this.type = "ai-text-transform", this.transformationType = r.transformationType || "default";
  }
  async process(t) {
    try {
      this.status = "running";
      const s = t.text;
      if (!s)
        throw new Error("No input text provided");
      return console.log(`Transforming text with type: ${this.transformationType}`), this.output = { result: `Simulated transformation of text: ${s}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class E extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "prompt");
    this.type = "ai-image-gen", this.prompt = r.prompt || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.prompt)
        throw new Error("No prompt provided for image generation");
      return console.log(`Generating image with prompt: ${this.prompt}`), this.output = { result: `Simulated image generation for prompt: ${this.prompt}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class F extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "prompt");
    this.type = "ai-video-gen", this.prompt = r.prompt || "";
  }
  async process(t) {
    try {
      if (this.status = "running", !this.prompt)
        throw new Error("No prompt provided for video generation");
      return console.log(`Generating video with prompt: ${this.prompt}`), this.output = { result: `Simulated video generation for prompt: ${this.prompt}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class C extends h {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "language");
    this.type = "audio-transcribe", this.language = r.language || "en";
  }
  async process(t) {
    try {
      if (this.status = "running", !t.audio)
        throw new Error("No audio input provided");
      return console.log(`Transcribing audio in language: ${this.language}`), this.output = { result: `Simulated transcription of audio in ${this.language}` }, this.status = "completed", this.output;
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class b extends h {
  constructor(e, t) {
    super(e, t), this.type = "audio-noise-reduction";
  }
  async process(e) {
    try {
      if (this.status = "running", !e.audio)
        throw new Error("No audio input provided");
      return console.log("Reducing noise in audio"), this.output = { result: "Simulated noise-reduced audio" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class P extends h {
  constructor(e, t) {
    super(e, t), this.type = "audio-mix";
  }
  async process(e) {
    try {
      this.status = "running";
      const t = e.tracks;
      if (!t || !Array.isArray(t))
        throw new Error("No audio tracks provided for mixing");
      return console.log("Mixing audio tracks"), this.output = { result: "Simulated mixed audio" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class $ extends h {
  constructor(e, t) {
    super(e, t), this.type = "video-compose";
  }
  async process(e) {
    try {
      this.status = "running";
      const t = e.clips;
      if (!t || !Array.isArray(t))
        throw new Error("No video clips provided for composition");
      return console.log("Composing video clips"), this.output = { result: "Simulated composed video" }, this.status = "completed", this.output;
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
const st = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AICommand: S,
  AIImageGen: E,
  AITextTransform: v,
  AIVideoGen: F,
  AudioMix: P,
  AudioNoiseReduction: b,
  AudioTranscribe: C,
  BaseActionNode: h,
  CustomScriptNode: N,
  JSONValidatorNode: x,
  VideoCompose: $
}, Symbol.toStringTag, { value: "Module" }));
class a {
  constructor(e, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "data");
    o(this, "status");
    o(this, "error");
    this.id = e, this.alias = t || e, this.type = "data", this.data = {}, this.status = "idle", this.error = null;
  }
  getDataByPath(e) {
    if (!e) return this.data;
    const t = e.split(".");
    let s = this.data;
    for (const r of t) {
      if (s == null) return;
      s = s[r];
    }
    return s;
  }
}
class A extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class I extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class q extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class T extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class R extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class k extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class D extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class Q extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class M extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class O extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class L extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class j extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class _ extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
class G extends a {
  constructor(t, s, r = {}) {
    super(t, s);
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
const rt = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  AudioFileNode: R,
  BaseDataNode: a,
  CSVFileNode: q,
  EmailSourceNode: G,
  FormDataNode: j,
  GraphQLAPINode: O,
  ImageFileNode: k,
  JSONFileNode: A,
  NoSQLDatabaseNode: Q,
  RESTAPINode: M,
  RSSFeedNode: _,
  SQLDatabaseNode: D,
  VideoFileNode: T,
  WebSocketNode: L,
  XMLFileNode: I
}, Symbol.toStringTag, { value: "Module" }));
class d {
  constructor(e, t) {
    o(this, "id");
    o(this, "alias");
    o(this, "type");
    o(this, "inputs");
    o(this, "status");
    o(this, "error");
    this.id = e, this.alias = t || e, this.type = "sink", this.inputs = {}, this.status = "idle", this.error = null;
  }
  setInput(e, t) {
    this.inputs[e] = t;
  }
}
class K extends d {
  constructor(e, t) {
    super(e, t), this.type = "output-log";
  }
  async process(e) {
    try {
      this.status = "running", console.log("OutputLogNode:", e), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class U extends d {
  constructor(t, s, r = {}) {
    super(t, s);
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
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class V extends d {
  constructor(e, t) {
    super(e, t), this.type = "send-push-notification";
  }
  async process(e) {
    try {
      this.status = "running", console.log("Simulated push notification:", e), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class W extends d {
  constructor(e, t) {
    super(e, t), this.type = "media-viewer";
  }
  async process(e) {
    try {
      this.status = "running", console.log("Simulated media viewer:", e), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class J extends d {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "apiKey");
    o(this, "videoTitle");
    o(this, "videoDescription");
    this.type = "upload-to-youtube", this.apiKey = r.apiKey || "", this.videoTitle = r.videoTitle || "", this.videoDescription = r.videoDescription || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to YouTube: ${this.videoTitle}`), this.status = "completed";
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class z extends d {
  constructor(e, t) {
    super(e, t), this.type = "upload-to-google-drive";
  }
  async process(e) {
    try {
      this.status = "running", console.log("Simulated upload to Google Drive:", e), this.status = "completed";
    } catch (t) {
      throw this.status = "error", this.error = t.message, t;
    }
  }
}
class B extends d {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "bucketName");
    o(this, "accessKey");
    o(this, "secretKey");
    this.type = "upload-to-s3", this.bucketName = r.bucketName || "", this.accessKey = r.accessKey || "", this.secretKey = r.secretKey || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to S3 bucket: ${this.bucketName}`), this.status = "completed";
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
class H extends d {
  constructor(t, s, r = {}) {
    super(t, s);
    o(this, "server");
    o(this, "username");
    o(this, "password");
    this.type = "upload-to-ftp", this.server = r.server || "", this.username = r.username || "", this.password = r.password || "";
  }
  async process(t) {
    try {
      this.status = "running", console.log(`Simulated upload to FTP server: ${this.server}`), this.status = "completed";
    } catch (s) {
      throw this.status = "error", this.error = s.message, s;
    }
  }
}
const ot = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BaseSinkNode: d,
  MediaViewerNode: W,
  OutputLogNode: K,
  SendEmailNode: U,
  SendPushNotificationNode: V,
  UploadFTPNode: H,
  UploadGGDriveNode: z,
  UploadS3Node: B,
  UploadToYoutubeNode: J
}, Symbol.toStringTag, { value: "Module" }));
export {
  tt as FlowManager,
  et as MemoryStorage,
  Y as NodeFactory,
  Z as Runtime,
  st as actionNodes,
  rt as dataSourceNodes,
  ot as sinkNodes
};
