import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import styled from 'styled-components';
import { NodeData } from '../../types';
import { getIconForNodeType } from '../ui/IconMap';
import { FaCube } from 'react-icons/fa';

const NodeContainer = styled.div<{ selected: boolean }>`
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 1px solid ${props => props.selected ? '#1a73e8' : '#ddd'};
  box-shadow: ${props => props.selected ? '0 0 10px rgba(26, 115, 232, 0.5)' : '0 1px 4px rgba(0, 0, 0, 0.1)'};
  width: 180px;
  font-family: sans-serif;
  position: relative;
`;

const NodeTitle = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #333;
  background: white;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #ddd;
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

  return (
    <NodeContainer selected={selected}>
      {/* <NodeTitle>{data.alias || 'Untitled Node'}</NodeTitle> */}
      <NodeHeader>
        <NodeIcon>{getIconForNodeType(data.type)}</NodeIcon>
        <div>{data.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</div>
      </NodeHeader>
      <NodeAlias>{data.alias}</NodeAlias>
      
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
