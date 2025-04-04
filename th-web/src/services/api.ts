import axios from 'axios';
import { FlowDefinition, NodeTypeDefinition, ExecutionResult } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const flowsApi = {
  getFlows: async (): Promise<FlowDefinition[]> => {
    const response = await api.get('/flows');
    return response.data;
  },
  
  getFlow: async (id: string): Promise<FlowDefinition> => {
    const response = await api.get(`/flows/${id}`);
    return response.data;
  },
  
  createFlow: async (flow: Omit<FlowDefinition, 'id'>): Promise<FlowDefinition> => {
    const response = await api.post('/flows', flow);
    return response.data;
  },
  
  updateFlow: async (id: string, flow: Partial<FlowDefinition>): Promise<FlowDefinition> => {
    const response = await api.put(`/flows/${id}`, flow);
    return response.data;
  },
  
  deleteFlow: async (id: string): Promise<void> => {
    await api.delete(`/flows/${id}`);
  },
  
  executeFlow: async (id: string): Promise<ExecutionResult> => {
    const response = await api.post(`/flows/${id}/execute`);
    return response.data;
  },
  
  pauseFlow: async (id: string): Promise<ExecutionResult> => {
    const response = await api.post(`/flows/${id}/pause`);
    return response.data;
  },
  
  resumeFlow: async (id: string): Promise<ExecutionResult> => {
    const response = await api.post(`/flows/${id}/resume`);
    return response.data;
  },
  
  stopFlow: async (id: string): Promise<ExecutionResult> => {
    const response = await api.post(`/flows/${id}/stop`);
    return response.data;
  }
};

export const nodeTypesApi = {
  getNodeTypes: async (): Promise<NodeTypeDefinition[]> => {
    const response = await api.get('/node-types');
    return response.data;
  },
  
  getNodeType: async (type: string): Promise<NodeTypeDefinition> => {
    const response = await api.get(`/node-types/${type}`);
    return response.data;
  }
};

export default {
  flows: flowsApi,
  nodeTypes: nodeTypesApi
};
