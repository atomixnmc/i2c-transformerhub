import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import styled from 'styled-components';
import { FlowDefinition, NodeTypeDefinition } from '../types';
import { flowsApi, nodeTypesApi } from '../services/api';
import CustomNode from './CustomNode';
import PropertyEditor from './PropertyEditor';

const FlowEditorContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
`;

const FlowCanvas = styled.div`
  flex: 1;
  height: 100%;
`;

const Sidebar = styled.div`
  width: 300px;
  height: 100%;
  background-color: #f8f9fa;
  border-left: 1px solid #dee2e6;
  padding: 16px;
  overflow-y: auto;
`;

const NodePalette = styled.div`
  margin-bottom: 20px;
`;

const NodeCategory = styled.div`
  margin-bottom: 16px;
`;

const CategoryTitle = styled.h3`
  font-size: 16px;
  margin-bottom: 8px;
  color: #495057;
`;

const NodeItem = styled.div`
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const NodeIcon = styled.span`
  margin-right: 8px;
  color: #6c757d;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 8px;
  background-color: #f1f3f5;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #0069d9;
  }
  
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
  
  &.secondary {
    background-color: #6c757d;
    
    &:hover {
      background-color: #5a6268;
    }
  }
  
  &.danger {
    background-color: #dc3545;
    
    &:hover {
      background-color: #c82333;
    }
  }
  
  &.success {
    background-color: #28a745;
    
    &:hover {
      background-color: #218838;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

// Define custom node types
const nodeTypes: NodeTypes = {
  customNode: CustomNode
};

interface FlowEditorProps {
  flowId?: string;
}

const FlowEditor: React.FC<FlowEditorProps> = ({ flowId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeTypes, setNodeTypes] = useState<NodeTypeDefinition[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState<string>('New Flow');
  const [flowDescription, setFlowDescription] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  
  // Load node types
  useEffect(() => {
    const fetchNodeTypes = async () => {
      try {
        const types = await nodeTypesApi.getNodeTypes();
        setNodeTypes(types);
      } catch (error) {
        console.error('Failed to fetch node types:', error);
      }
    };
    
    fetchNodeTypes();
  }, []);
  
  // Load flow if flowId is provided
  useEffect(() => {
    if (flowId) {
      const fetchFlow = async () => {
        try {
          const flow = await flowsApi.getFlow(flowId);
          setFlowName(flow.name);
          setFlowDescription(flow.description || '');
          
          // Convert flow definition to ReactFlow nodes and edges
          const flowNodes = flow.nodes.map(node => ({
            id: node.id,
            type: 'customNode',
            position: node.position,
            data: {
              id: node.id,
              alias: node.alias,
              type: node.type,
              properties: node.properties,
              inputs: [], // Will be populated from node type definition
              outputs: []  // Will be populated from node type definition
            }
          }));
          
          // Fetch node type information to populate inputs and outputs
          for (const node of flowNodes) {
            try {
              const nodeType = await nodeTypesApi.getNodeType(node.data.type);
              node.data.inputs = nodeType.inputs;
              node.data.outputs = nodeType.outputs;
            } catch (error) {
              console.error(`Failed to fetch node type for ${node.data.type}:`, error);
            }
          }
          
          const flowEdges = flow.connections.map(conn => ({
            id: conn.id,
            source: conn.sourceNodeId,
            target: conn.targetNodeId,
            sourceHandle: conn.outputName,
            targetHandle: conn.inputName
          }));
          
          setNodes(flowNodes);
          setEdges(flowEdges);
        } catch (error) {
          console.error('Failed to fetch flow:', error);
        }
      };
      
      fetchFlow();
    }
  }, [flowId, setNodes, setEdges]);
  
  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);
  
  // Handle node deselection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  
  // Handle connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    // Create a unique ID for the new edge
    const edgeId = `edge_${Date.now()}`;
    setEdges(edges => addEdge({ ...connection, id: edgeId }, edges));
  }, [setEdges]);
  
  // Handle drag and drop from node palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      
      const nodeType = event.dataTransfer.getData('application/reactflow');
      if (!nodeType) return;
      
      // Get the position where the node was dropped
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      
      // Find the node type definition
      const nodeTypeDef = nodeTypes.find(type => type.type === nodeType);
      if (!nodeTypeDef) return;
      
      // Create a unique ID for the new node
      const nodeId = `node_${Date.now()}`;
      
      // Create the new node
      const newNode = {
        id: nodeId,
        type: 'customNode',
        position,
        data: {
          id: nodeId,
          alias: nodeTypeDef.name,
          type: nodeType,
          properties: {},
          inputs: nodeTypeDef.inputs,
          outputs: nodeTypeDef.outputs
        }
      };
      
      setNodes(nodes => [...nodes, newNode]);
    },
    [reactFlowInstance, nodeTypes, setNodes]
  );
  
  // Handle node property updates
  const updateNodeProperties = useCallback((nodeId: string, properties: Record<string, any>) => {
    setNodes(nodes => 
      nodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, properties } } 
          : node
      )
    );
  }, [setNodes]);
  
  // Save the flow
  const saveFlow = useCallback(async () => {
    try {
      // Convert ReactFlow nodes and edges to flow definition
      const flowDefinition: Omit<FlowDefinition, 'id'> = {
        name: flowName,
        description: flowDescription,
        nodes: nodes.map(node => ({
          id: node.id,
          alias: node.data.alias,
          type: node.data.type,
          position: node.position,
          properties: node.data.properties
        })),
        connections: edges.map(edge => ({
          id: edge.id,
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          outputName: edge.sourceHandle || 'output',
          inputName: edge.targetHandle || 'data'
        }))
      };
      
      if (flowId) {
        // Update existing flow
        await flowsApi.updateFlow(flowId, flowDefinition);
      } else {
        // Create new flow
        await flowsApi.createFlow(flowDefinition);
      }
      
      alert('Flow saved successfully!');
    } catch (error) {
      console.error('Failed to save flow:', error);
      alert('Failed to save flow. Please try again.');
    }
  }, [flowId, flowName, flowDescription, nodes, edges]);
  
  // Execute the flow
  const executeFlow = useCallback(async () => {
    if (!flowId) {
      alert('Please save the flow before executing.');
      return;
    }
    
    try {
      setIsExecuting(true);
      setExecutionStatus('running');
      
      const result = await flowsApi.executeFlow(flowId);
      
      setExecutionStatus(result.status);
      
      if (result.status === 'error') {
        alert(`Execution failed: ${result.error}`);
      } else if (result.status === 'completed') {
        alert('Execution completed successfully!');
      }
    } catch (error) {
      console.error('Failed to execute flow:', error);
      setExecutionStatus('error');
      alert('Failed to execute flow. Please try again.');
    } finally {
      setIsExecuting(false);
    }
  }, [flowId]);
  
  // Render node palette items
  const renderNodePalette = () => {
    const sourceNodes = nodeTypes.filter(type => type.category === 'source');
    const actionNodes = nodeTypes.filter(type => type.category === 'action');
    
    return (
      <NodePalette>
        <NodeCategory>
          <CategoryTitle>Data Sources</CategoryTitle>
          {sourceNodes.map(nodeType => (
            <NodeItem
              key={nodeType.type}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', nodeType.type);
                event.dataTransfer.effectAllowed = 'move';
              }}
            >
              <NodeIcon>
                <i className={`fas fa-${nodeType.icon || 'cube'}`}></i>
              </NodeIcon>
              {nodeType.name}
            </NodeItem>
          ))}
        </NodeCategory>
        
        <NodeCategory>
          <CategoryTitle>Actions</CategoryTitle>
          {actionNodes.map(nodeType => (
            <NodeItem
              key={nodeType.type}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', nodeType.type);
                event.dataTransfer.effectAllowed = 'move';
              }}
            >
              <NodeIcon>
                <i className={`fas fa-${nodeType.icon || 'cube'}`}></i>
              </NodeIcon>
              {nodeType.name}
            </NodeItem>
          ))}
        </NodeCategory>
      </NodePalette>
    );
  };
  
  return (
    <FlowEditorContainer>
      <FlowCanvas ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
            <Background />
            <Panel position="top-left">
              <ControlPanel>
                <div>
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    placeholder="Flow Name"
                    style={{ marginRight: '8px' }}
                  />
                </div>
                <ButtonGroup>
                  <Button onClick={saveFlow}>Save</Button>
                  <Button 
                    onClick={executeFlow} 
                    disabled={isExecuting || !flowId}
                    className={executionStatus === 'completed' ? 'success' : ''}
                  >
                    {isExecuting ? 'Executing...' : 'Execute'}
                  </Button>
                </ButtonGroup>
              </ControlPanel>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </FlowCanvas>
      
      <Sidebar>
        {selectedNode ? (
          <PropertyEditor 
            node={selectedNode} 
            onUpdate={(properties) => updateNodeProperties(selectedNode.id, properties)} 
          />
        ) : (
          renderNodePalette()
        )}
      </Sidebar>
    </FlowEditorContainer>
  );
};

export default FlowEditor;
