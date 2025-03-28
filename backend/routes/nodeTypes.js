const express = require('express');
const router = express.Router();

// Import shared node definitions
const dataSourceNodes = require('../../shared/dataSourceNodes');
const actionNodes = require('../../shared/actionNodes');

// Get all available node types
router.get('/', (req, res) => {
  // Extract node type information
  const dataSourceNodeTypes = Object.keys(dataSourceNodes)
    .filter(key => key !== 'BaseDataNode')
    .map(key => {
      const NodeClass = dataSourceNodes[key];
      const instance = new NodeClass('temp', 'temp');
      
      return {
        type: instance.type,
        category: 'source',
        name: key.replace('Node', ''),
        description: `${key.replace('Node', '')} data source`,
        inputs: [],
        outputs: ['output'],
        icon: getIconForNodeType(instance.type)
      };
    });
    
  const actionNodeTypes = Object.keys(actionNodes)
    .filter(key => key !== 'BaseActionNode')
    .map(key => {
      const NodeClass = actionNodes[key];
      const instance = new NodeClass('temp', 'temp');
      
      return {
        type: instance.type,
        category: 'action',
        name: key.replace('Node', ''),
        description: `${key.replace('Node', '')} action`,
        inputs: ['data'],
        outputs: ['output'],
        icon: getIconForNodeType(instance.type)
      };
    });
    
  res.json([...dataSourceNodeTypes, ...actionNodeTypes]);
});

// Get a specific node type
router.get('/:type', (req, res) => {
  const { type } = req.params;
  
  // Find the node type in data source nodes
  let nodeInfo = null;
  
  // Check in data source nodes
  for (const key of Object.keys(dataSourceNodes)) {
    if (key === 'BaseDataNode') continue;
    
    const NodeClass = dataSourceNodes[key];
    const instance = new NodeClass('temp', 'temp');
    
    if (instance.type === type) {
      nodeInfo = {
        type: instance.type,
        category: 'source',
        name: key.replace('Node', ''),
        description: `${key.replace('Node', '')} data source`,
        inputs: [],
        outputs: ['output'],
        properties: getPropertiesForNodeType(instance),
        icon: getIconForNodeType(instance.type)
      };
      break;
    }
  }
  
  // If not found, check in action nodes
  if (!nodeInfo) {
    for (const key of Object.keys(actionNodes)) {
      if (key === 'BaseActionNode') continue;
      
      const NodeClass = actionNodes[key];
      const instance = new NodeClass('temp', 'temp');
      
      if (instance.type === type) {
        nodeInfo = {
          type: instance.type,
          category: 'action',
          name: key.replace('Node', ''),
          description: `${key.replace('Node', '')} action`,
          inputs: ['data'],
          outputs: ['output'],
          properties: getPropertiesForNodeType(instance),
          icon: getIconForNodeType(instance.type)
        };
        break;
      }
    }
  }
  
  if (!nodeInfo) {
    return res.status(404).json({ error: 'Node type not found' });
  }
  
  res.json(nodeInfo);
});

// Helper function to get properties for a node type
function getPropertiesForNodeType(instance) {
  const properties = {};
  
  // Extract properties from the instance
  for (const [key, value] of Object.entries(instance)) {
    // Skip internal properties
    if (['id', 'alias', 'type', 'status', 'error', 'output', 'inputs', 'data'].includes(key)) {
      continue;
    }
    
    // Determine property type
    let type = typeof value;
    if (Array.isArray(value)) {
      type = 'array';
    } else if (value === null) {
      type = 'null';
    }
    
    properties[key] = {
      type,
      default: value,
      required: false // In a real implementation, this would be determined from the class
    };
  }
  
  return properties;
}

// Helper function to get icon for a node type
function getIconForNodeType(type) {
  // Map node types to icon names
  const iconMap = {
    // Data source nodes
    'json-file': 'file-json',
    'xml-file': 'file-code',
    'csv-file': 'file-csv',
    'video-file': 'file-video',
    'audio-file': 'file-audio',
    'image-file': 'file-image',
    'sql-database': 'database',
    'nosql-database': 'database',
    'rest-api': 'cloud',
    'graphql-api': 'cloud',
    'websocket': 'plug',
    'form-data': 'form',
    'rss-feed': 'rss',
    'email-source': 'envelope',
    'iot-device': 'microchip',
    
    // Action nodes
    'json-validator': 'check-circle',
    'xml-transformer': 'exchange-alt',
    'data-filter': 'filter',
    'data-mapper': 'map',
    'email-sender': 'paper-plane',
    'video-transcoder': 'video',
    'youtube-uploader': 'youtube',
    'image-processor': 'image',
    'text-analyzer': 'font',
    'data-aggregator': 'chart-bar',
    'http-request': 'globe',
    'file-writer': 'file-export',
    'database-writer': 'database',
    'data-joiner': 'link',
    'scheduler': 'clock',
    'conditional-branch': 'code-branch',
    'template-renderer': 'file-alt',
    'data-validator': 'check-double',
    'notification-sender': 'bell',
    'ml-predictor': 'brain'
  };
  
  return iconMap[type] || 'cube';
}

module.exports = router;
