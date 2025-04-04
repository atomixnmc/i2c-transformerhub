import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import styled from 'styled-components';
import { NodeData, NodeTypeDefinition } from '../../types';
import { nodeTypesApi } from '../../services/api';

const PropertyEditorContainer = styled.div`
  padding: 16px;
`;

const PropertyEditorTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 16px;
  color: #495057;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;
`;

const PropertyLabel = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #495057;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const PropertySelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const PropertyTextarea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #0069d9;
  }
`;

interface PropertyEditorProps {
  node: Node<NodeData>;
  onUpdate: (properties: Record<string, any>) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ node, onUpdate }) => {
  const [nodeType, setNodeType] = useState<NodeTypeDefinition | null>(null);
  const [properties, setProperties] = useState<Record<string, any>>({});
  const [alias, setAlias] = useState<string>(node.data.alias || '');
  
  // Fetch node type information
  useEffect(() => {
    const fetchNodeType = async () => {
      try {
        const type = await nodeTypesApi.getNodeType(node.data.type);
        setNodeType(type);
        
        // Initialize properties with defaults from node type
        const initialProperties: Record<string, any> = {};
        if (type.properties) {
          Object.entries(type.properties).forEach(([key, prop]) => {
            initialProperties[key] = node.data.properties[key] !== undefined 
              ? node.data.properties[key] 
              : prop.default;
          });
        }
        
        setProperties({ ...initialProperties, ...node.data.properties });
      } catch (error) {
        console.error('Failed to fetch node type:', error);
      }
    };
    
    fetchNodeType();
  }, [node.data.type, node.data.properties]);
  
  // Handle property change
  const handlePropertyChange = (key: string, value: any) => {
    setProperties(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Apply changes
  const handleApply = () => {
    // Update node properties
    onUpdate({
      ...properties,
      alias
    });
  };
  
  // Render property input based on type
  const renderPropertyInput = (key: string, property: any) => {
    const value = properties[key];
    const type = property.type;
    
    switch (type) {
      case 'string':
        if (property.options) {
          return (
            <PropertySelect
              value={value || ''}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
            >
              {property.options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </PropertySelect>
          );
        } else {
          return (
            <PropertyInput
              type="text"
              value={value || ''}
              onChange={(e) => handlePropertyChange(key, e.target.value)}
            />
          );
        }
      
      case 'number':
        return (
          <PropertyInput
            type="number"
            value={value || 0}
            onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
          />
        );
      
      case 'boolean':
        return (
          <PropertySelect
            value={value ? 'true' : 'false'}
            onChange={(e) => handlePropertyChange(key, e.target.value === 'true')}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </PropertySelect>
        );
      
      case 'object':
      case 'array':
        return (
          <PropertyTextarea
            value={JSON.stringify(value, null, 2) || ''}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handlePropertyChange(key, parsed);
              } catch (error) {
                // Allow invalid JSON during editing
                console.log('Invalid JSON, not updating state');
              }
            }}
          />
        );
      
      default:
        return (
          <PropertyInput
            type="text"
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
          />
        );
    }
  };
  
  if (!nodeType) {
    return <div>Loading...</div>;
  }
  
  return (
    <PropertyEditorContainer>
      <PropertyEditorTitle>
        {nodeType.name} Properties
      </PropertyEditorTitle>
      
      <PropertyGroup>
        <PropertyLabel>Node Alias</PropertyLabel>
        <PropertyInput
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </PropertyGroup>
      
      {nodeType.properties && Object.entries(nodeType.properties).map(([key, property]) => (
        <PropertyGroup key={key}>
          <PropertyLabel>
            {key.charAt(0).toUpperCase() + key.slice(1)}
            {property.required && <span style={{ color: 'red' }}> *</span>}
          </PropertyLabel>
          {renderPropertyInput(key, property)}
        </PropertyGroup>
      ))}
      
      <Button onClick={handleApply}>Apply Changes</Button>
    </PropertyEditorContainer>
  );
};

export default PropertyEditor;
