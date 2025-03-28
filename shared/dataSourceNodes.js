// Data Source Nodes for TransformerHub
// These nodes represent different types of data sources that can be used in dataflows

/**
 * Base class for all data source nodes
 */
class BaseDataNode {
  constructor(id, alias) {
    this.id = id;
    this.alias = alias || id;
    this.type = 'data';
    this.data = {};
    this.status = 'idle';
    this.error = null;
  }

  /**
   * Load data from the source
   * @returns {Promise<any>} The loaded data
   */
  async load() {
    throw new Error('Method not implemented');
  }

  /**
   * Get node data by path
   * @param {string} path Dot notation path to the data
   * @returns {any} The data at the specified path
   */
  getDataByPath(path) {
    if (!path) return this.data;
    
    const parts = path.split('.');
    let current = this.data;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }
}

/**
 * JSON File Data Source Node
 * Loads data from a JSON file
 */
class JSONFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'json-file';
    this.filePath = options.filePath || '';
    this.schema = options.schema || null;
  }

  async load() {
    try {
      this.status = 'running';
      
      // In a real implementation, this would use fs.readFile
      // For demonstration, we'll simulate loading
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // Simulated file loading
      const fileContent = await simulateFileLoad(this.filePath);
      this.data = JSON.parse(fileContent);
      
      // Validate against schema if provided
      if (this.schema) {
        // Schema validation would happen here
      }
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * XML File Data Source Node
 * Loads data from an XML file
 */
class XMLFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'xml-file';
    this.filePath = options.filePath || '';
    this.xpath = options.xpath || '';
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // Simulated file loading
      const fileContent = await simulateFileLoad(this.filePath);
      
      // In a real implementation, this would use an XML parser
      // For demonstration, we'll simulate parsing
      this.data = simulateXMLParse(fileContent, this.xpath);
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * CSV File Data Source Node
 * Loads data from a CSV file
 */
class CSVFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'csv-file';
    this.filePath = options.filePath || '';
    this.delimiter = options.delimiter || ',';
    this.hasHeader = options.hasHeader !== false;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // Simulated file loading
      const fileContent = await simulateFileLoad(this.filePath);
      
      // In a real implementation, this would use a CSV parser
      // For demonstration, we'll simulate parsing
      this.data = simulateCSVParse(fileContent, this.delimiter, this.hasHeader);
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * Video File Data Source Node
 * Loads metadata and content from a video file
 */
class VideoFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'video-file';
    this.filePath = options.filePath || '';
    this.extractMetadata = options.extractMetadata !== false;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // In a real implementation, this would use a video processing library
      // For demonstration, we'll simulate loading
      this.data = {
        path: this.filePath,
        metadata: this.extractMetadata ? {
          duration: '00:10:30',
          resolution: '1920x1080',
          codec: 'H.264',
          fps: 30
        } : null,
        // The actual video content would be handled differently
        // This is just a placeholder
        content: 'video-binary-data'
      };
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * Audio File Data Source Node
 * Loads metadata and content from an audio file
 */
class AudioFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'audio-file';
    this.filePath = options.filePath || '';
    this.extractMetadata = options.extractMetadata !== false;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // In a real implementation, this would use an audio processing library
      // For demonstration, we'll simulate loading
      this.data = {
        path: this.filePath,
        metadata: this.extractMetadata ? {
          duration: '00:03:45',
          bitrate: '320kbps',
          channels: 2,
          sampleRate: 44100
        } : null,
        // The actual audio content would be handled differently
        // This is just a placeholder
        content: 'audio-binary-data'
      };
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * Image File Data Source Node
 * Loads metadata and content from an image file
 */
class ImageFileNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'image-file';
    this.filePath = options.filePath || '';
    this.extractMetadata = options.extractMetadata !== false;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.filePath) {
        throw new Error('File path not specified');
      }
      
      // In a real implementation, this would use an image processing library
      // For demonstration, we'll simulate loading
      this.data = {
        path: this.filePath,
        metadata: this.extractMetadata ? {
          dimensions: '1920x1080',
          format: 'JPEG',
          colorSpace: 'RGB',
          size: '2.4MB'
        } : null,
        // The actual image content would be handled differently
        // This is just a placeholder
        content: 'image-binary-data'
      };
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * SQL Database Data Source Node
 * Executes SQL queries and loads the results
 */
class SQLDatabaseNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'sql-database';
    this.connectionString = options.connectionString || '';
    this.query = options.query || '';
    this.parameters = options.parameters || [];
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.connectionString) {
        throw new Error('Connection string not specified');
      }
      
      if (!this.query) {
        throw new Error('SQL query not specified');
      }
      
      // In a real implementation, this would use a database client
      // For demonstration, we'll simulate a query
      this.data = await simulateSQLQuery(this.connectionString, this.query, this.parameters);
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * NoSQL Database Data Source Node
 * Queries a NoSQL database and loads the results
 */
class NoSQLDatabaseNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'nosql-database';
    this.connectionString = options.connectionString || '';
    this.collection = options.collection || '';
    this.query = options.query || {};
    this.projection = options.projection || {};
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.connectionString) {
        throw new Error('Connection string not specified');
      }
      
      if (!this.collection) {
        throw new Error('Collection not specified');
      }
      
      // In a real implementation, this would use a NoSQL database client
      // For demonstration, we'll simulate a query
      this.data = await simulateNoSQLQuery(
        this.connectionString, 
        this.collection, 
        this.query, 
        this.projection
      );
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * REST API Data Source Node
 * Makes HTTP requests to REST APIs and loads the results
 */
class RESTAPINode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'rest-api';
    this.url = options.url || '';
    this.method = options.method || 'GET';
    this.headers = options.headers || {};
    this.body = options.body || null;
    this.params = options.params || {};
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.url) {
        throw new Error('URL not specified');
      }
      
      // In a real implementation, this would use fetch or axios
      // For demonstration, we'll simulate an API call
      this.data = await simulateAPICall(
        this.url,
        this.method,
        this.headers,
        this.body,
        this.params
      );
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * GraphQL API Data Source Node
 * Executes GraphQL queries and loads the results
 */
class GraphQLAPINode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'graphql-api';
    this.url = options.url || '';
    this.query = options.query || '';
    this.variables = options.variables || {};
    this.headers = options.headers || {};
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.url) {
        throw new Error('URL not specified');
      }
      
      if (!this.query) {
        throw new Error('GraphQL query not specified');
      }
      
      // In a real implementation, this would use a GraphQL client
      // For demonstration, we'll simulate a query
      this.data = await simulateGraphQLQuery(
        this.url,
        this.query,
        this.variables,
        this.headers
      );
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * WebSocket Data Source Node
 * Connects to a WebSocket server and streams data
 */
class WebSocketNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'websocket';
    this.url = options.url || '';
    this.protocols = options.protocols || [];
    this.autoReconnect = options.autoReconnect !== false;
    this.messageHandler = options.messageHandler || null;
    this.connection = null;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.url) {
        throw new Error('URL not specified');
      }
      
      // In a real implementation, this would use WebSocket
      // For demonstration, we'll simulate a connection
      this.connection = await simulateWebSocketConnection(
        this.url,
        this.protocols,
        this.autoReconnect
      );
      
      // Set up message handling
      if (this.messageHandler) {
        this.connection.onmessage = (message) => {
          this.data = this.messageHandler(message);
        };
      } else {
        this.connection.onmessage = (message) => {
          this.data = message;
        };
      }
      
      this.status = 'completed';
      return this.connection;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * Form Data Source Node
 * Processes form data
 */
class FormDataNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'form-data';
    this.formData = options.formData || {};
    this.validate = options.validate !== false;
    this.validationRules = options.validationRules || {};
  }

  async load() {
    try {
      this.status = 'running';
      
      if (Object.keys(this.formData).length === 0) {
        throw new Error('Form data is empty');
      }
      
      // Copy the form data
      this.data = { ...this.formData };
      
      // Validate if required
      if (this.validate && Object.keys(this.validationRules).length > 0) {
        const validationErrors = {};
        
        for (const [field, rule] of Object.entries(this.validationRules)) {
          if (rule.required && !this.data[field]) {
            validationErrors[field] = 'This field is required';
          } else if (rule.pattern && this.data[field] && !new RegExp(rule.pattern).test(this.data[field])) {
            validationErrors[field] = rule.message || 'Invalid format';
          }
        }
        
        if (Object.keys(validationErrors).length > 0) {
          this.data.validationErrors = validationErrors;
          throw new Error('Form validation failed');
        }
      }
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * RSS Feed Data Source Node
 * Fetches and parses RSS feeds
 */
class RSSFeedNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'rss-feed';
    this.url = options.url || '';
    this.maxItems = options.maxItems || 10;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.url) {
        throw new Error('URL not specified');
      }
      
      // In a real implementation, this would use an RSS parser
      // For demonstration, we'll simulate fetching and parsing
      this.data = await simulateRSSFeed(this.url, this.maxItems);
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * Email Source Node
 * Fetches emails from a mailbox
 */
class EmailSourceNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'email-source';
    this.server = options.server || '';
    this.username = options.username || '';
    this.password = options.password || '';
    this.folder = options.folder || 'INBOX';
    this.maxEmails = options.maxEmails || 10;
    this.markAsRead = options.markAsRead !== false;
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.server || !this.username || !this.password) {
        throw new Error('Email server credentials not fully specified');
      }
      
      // In a real implementation, this would use an email client library
      // For demonstration, we'll simulate fetching emails
      this.data = await simulateEmailFetch(
        this.server,
        this.username,
        this.password,
        this.folder,
        this.maxEmails,
        this.markAsRead
      );
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

/**
 * IoT Device Data Source Node
 * Connects to IoT devices and retrieves data
 */
class IoTDeviceNode extends BaseDataNode {
  constructor(id, alias, options = {}) {
    super(id, alias);
    this.type = 'iot-device';
    this.deviceId = options.deviceId || '';
    this.protocol = options.protocol || 'mqtt';
    this.connectionString = options.connectionString || '';
    this.topics = options.topics || [];
    this.interval = options.interval || 5000; // ms
  }

  async load() {
    try {
      this.status = 'running';
      
      if (!this.deviceId || !this.connectionString) {
        throw new Error('Device ID or connection string not specified');
      }
      
      // In a real implementation, this would use an IoT protocol library
      // For demonstration, we'll simulate device connection
      this.data = await simulateIoTDevice(
        this.deviceId,
        this.protocol,
        this.connectionString,
        this.topics,
        this.interval
      );
      
      this.status = 'completed';
      return this.data;
    } catch (error) {
      this.status = 'error';
      this.error = error.message;
      throw error;
    }
  }
}

// Simulation helper functions
// These would be replaced with actual implementations in a real system

async function simulateFileLoad(filePath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (filePath.endsWith('.json')) {
        resolve('{"name":"Example","value":42,"items":["one","two","three"]}');
      } else if (filePath.endsWith('.xml')) {
        resolve('<root><name>Example</name><value>42</value><items><item>one</item><item>two</item><item>three</item></items></root>');
      } else if (filePath.endsWith('.csv')) {
        resolve('name,value,category\nItem1,42,A\nItem2,17,B\nItem3,90,A');
      } else {
        resolve('Sample file content');
      }
    }, 100);
  });
}

function simulateXMLParse(content, xpath) {
  // Simple simulation
  return {
    name: 'Example',
    value: 42,
    items: ['one', 'two', 'three']
  };
}

function simulateCSVParse(content, delimiter, hasHeader) {
  // Simple simulation
  if (hasHeader) {
    return [
      { name: 'Item1', value: 42, category: 'A' },
      { name: 'Item2', value: 17, category: 'B' },
      { name: 'Item3', value: 90, category: 'A' }
    ];
  } else {
    return [
      ['name', 'value', 'category'],
      ['Item1', 42, 'A'],
      ['Item2', 17, 'B'],
      ['Item3', 90, 'A']
    ];
  }
}

async function simulateSQLQuery(connectionString, query, parameters) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'Product A', price: 29.99 },
        { id: 2, name: 'Product B', price: 49.99 },
        { id: 3, name: 'Product C', price: 19.99 }
      ]);
    }, 200);
  });
}

async function simulateNoSQLQuery(connectionString, collection, query, projection) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { _id: 'abc123', name: 'Document 1', tags: ['tag1', 'tag2'] },
        { _id: 'def456', name: 'Document 2', tags: ['tag2', 'tag3'] },
        { _id: 'ghi789', name: 'Document 3', tags: ['tag1', 'tag3'] }
      ]);
    }, 200);
  });
}

async function simulateAPICall(url, method, headers, body, params) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 200,
        data: {
          id: 123,
          name: 'API Response',
          timestamp: new Date().toISOString(),
          results: [
            { id: 1, value: 'First item' },
            { id: 2, value: 'Second item' },
            { id: 3, value: 'Third item' }
          ]
        }
      });
    }, 300);
  });
}

async function simulateGraphQLQuery(url, query, variables, headers) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          user: {
            id: 'user123',
            name: 'John Doe',
            email: 'john@example.com',
            posts: [
              { id: 'post1', title: 'First Post' },
              { id: 'post2', title: 'Second Post' }
            ]
          }
        }
      });
    }, 300);
  });
}

async function simulateWebSocketConnection(url, protocols, autoReconnect) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        url,
        protocols,
        readyState: 1, // OPEN
        onmessage: null,
        send: (data) => console.log(`WebSocket send: ${data}`),
        close: () => console.log('WebSocket closed')
      });
    }, 200);
  });
}

async function simulateRSSFeed(url, maxItems) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: 'Example RSS Feed',
        description: 'This is an example RSS feed',
        link: url,
        items: [
          {
            title: 'First Article',
            description: 'This is the first article',
            link: `${url}/article1`,
            pubDate: new Date().toISOString()
          },
          {
            title: 'Second Article',
            description: 'This is the second article',
            link: `${url}/article2`,
            pubDate: new Date(Date.now() - 86400000).toISOString()
          },
          {
            title: 'Third Article',
            description: 'This is the third article',
            link: `${url}/article3`,
            pubDate: new Date(Date.now() - 172800000).toISOString()
          }
        ].slice(0, maxItems)
      });
    }, 300);
  });
}

async function simulateEmailFetch(server, username, password, folder, maxEmails, markAsRead) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        folder,
        totalEmails: 25,
        unreadEmails: 10,
        emails: [
          {
            id: 'email1',
            from: 'sender1@example.com',
            to: username,
            subject: 'Important Update',
            body: 'This is an important update about your account.',
            date: new Date().toISOString(),
            attachments: []
          },
          {
            id: 'email2',
            from: 'sender2@example.com',
            to: username,
            subject: 'Meeting Reminder',
            body: 'Don\'t forget about our meeting tomorrow at 2 PM.',
            date: new Date(Date.now() - 86400000).toISOString(),
            attachments: []
          },
          {
            id: 'email3',
            from: 'sender3@example.com',
            to: username,
            subject: 'Project Status',
            body: 'Here\'s the latest update on the project status.',
            date: new Date(Date.now() - 172800000).toISOString(),
            attachments: [
              { name: 'status.pdf', size: 1024000 }
            ]
          }
        ].slice(0, maxEmails)
      });
    }, 400);
  });
}

async function simulateIoTDevice(deviceId, protocol, connectionString, topics, interval) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        deviceId,
        protocol,
        connected: true,
        lastUpdated: new Date().toISOString(),
        data: {
          temperature: 22.5,
          humidity: 45.2,
          pressure: 1013.2,
          battery: 87
        },
        topics: topics.map(topic => ({
          name: topic,
          lastMessage: {
            timestamp: new Date().toISOString(),
            payload: { value: Math.random() * 100 }
          }
        }))
      });
    }, 300);
  });
}

// Export all node types
module.exports = {
  BaseDataNode,
  JSONFileNode,
  XMLFileNode,
  CSVFileNode,
  VideoFileNode,
  AudioFileNode,
  ImageFileNode,
  SQLDatabaseNode,
  NoSQLDatabaseNode,
  RESTAPINode,
  GraphQLAPINode,
  WebSocketNode,
  FormDataNode,
  RSSFeedNode,
  EmailSourceNode,
  IoTDeviceNode
};
