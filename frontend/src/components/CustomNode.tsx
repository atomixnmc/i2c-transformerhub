import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import styled from 'styled-components';
import { NodeData } from '../types';

const NodeContainer = styled.div<{ selected: boolean }>`
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 1px solid ${props => props.selected ? '#1a73e8' : '#ddd'};
  box-shadow: ${props => props.selected ? '0 0 10px rgba(26, 115, 232, 0.5)' : '0 1px 4px rgba(0, 0, 0, 0.1)'};
  width: 180px;
  font-family: sans-serif;
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const NodeIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #6c757d;
`;

const NodeTitle = styled.div`
  font-weight: bold;
  font-size: 14px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NodeType = styled.div`
  font-size: 10px;
  color: #6c757d;
  margin-bottom: 8px;
`;

const NodeAlias = styled.div`
  font-size: 12px;
  color: #495057;
  margin-bottom: 8px;
  font-style: italic;
`;

const HandleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
`;

const HandleLabel = styled.div`
  font-size: 10px;
  color: #6c757d;
  margin-left: 12px;
`;

const CustomNode: React.FC<NodeProps<NodeData>> = ({ data, selected }) => {
  const getIconForNodeType = (type: string) => {
    // Map node types to icon names
    const iconMap: Record<string, string> = {
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
  };

  return (
    <NodeContainer selected={selected}>
      <NodeHeader>
        <NodeIcon>
          <i className={`fas fa-${getIconForNodeType(data.type)}`}></i>
        </NodeIcon>
        <NodeTitle>{data.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</NodeTitle>
      </NodeHeader>
      
      <NodeAlias>{data.alias}</NodeAlias>
      <NodeType>{data.type}</NodeType>
      
      {/* Input handles */}
      {data.inputs && data.inputs.length > 0 && (
        <HandleContainer>
          {data.inputs.map((input, index) => (
            <div key={`input-${index}`}>
              <HandleLabel>{input}</HandleLabel>
              <Handle
                type="target"
                position={Position.Left}
                id={input}
                style={{ 
                  background: '#0984e3', 
                  width: 8, 
                  height: 8,
                  top: `${50 + (index * 20)}px`
                }}
              />
            </div>
          ))}
        </HandleContainer>
      )}
      
      {/* Output handles */}
      {data.outputs && data.outputs.length > 0 && (
        <HandleContainer>
          {data.outputs.map((output, index) => (
            <div key={`output-${index}`}>
              <HandleLabel style={{ textAlign: 'right', marginRight: 12 }}>{output}</HandleLabel>
              <Handle
                type="source"
                position={Position.Right}
                id={output}
                style={{ 
                  background: '#00b894', 
                  width: 8, 
                  height: 8,
                  top: `${50 + (index * 20)}px`
                }}
              />
            </div>
          ))}
        </HandleContainer>
      )}
    </NodeContainer>
  );
};

export default memo(CustomNode);
