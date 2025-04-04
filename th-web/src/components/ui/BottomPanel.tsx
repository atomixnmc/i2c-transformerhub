import React, { useState } from 'react';
import styled from 'styled-components';
import { LoggingPanel } from './LoggingPanel';
import AIAssistantUI from './AIAssistantUI';
import { FaGripLines } from 'react-icons/fa';

const Panel = styled.div<{ minimized: boolean; height: number }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${props => (props.minimized ? '30px' : `${props.height}px`)};
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  overflow-y: ${props => (props.minimized ? 'hidden' : 'auto')};
  padding: ${props => (props.minimized ? '4px' : '8px')};
  transition: height 0.3s, padding 0.3s;
`;

const ResizeHandle = styled.div`
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 10px;
  cursor: ns-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #0056b3;
  }
`;

const MinimizedTitle = styled.div`
  font-size: 14px;
  color: #495057;
  text-align: center;
  line-height: 30px;
`;

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #dee2e6;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 8px;
  background-color: ${props => (props.active ? '#007bff' : '#f8f9fa')};
  color: ${props => (props.active ? 'white' : '#495057')};
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${props => (props.active ? '#0056b3' : '#e9ecef')};
  }
`;

const TabContent = styled.div`
  padding: 8px;
`;

interface LoggingPanelProps {
  minimized: boolean;
  logs: string[];
  onToggle: () => void;
}

const BottomPanelContainer: React.FC<LoggingPanelProps> = ({ minimized, logs, onToggle }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'ai' | 'timeline' | 'prefabs' | 'tests' | 'share' | 'teams'>('logs');
  const [height, setHeight] = useState(320);

  const handleResize = (e: React.MouseEvent) => {
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(200, startHeight + (startY - moveEvent.clientY));
      setHeight(newHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <Panel minimized={minimized} height={height}>
        {!minimized && (
          <>
            <ResizeHandle onMouseDown={handleResize}>
              <FaGripLines />
            </ResizeHandle>
            <Tabs>
              <Tab active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
                Logs
              </Tab>
              <Tab active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>
                AI Assistant
              </Tab>
              <Tab active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>
                Timeline
              </Tab>
              <Tab active={activeTab === 'prefabs'} onClick={() => setActiveTab('prefabs')}>
                Prefabs
              </Tab>
              <Tab active={activeTab === 'tests'} onClick={() => setActiveTab('tests')}>
                Tests
              </Tab>
              <Tab active={activeTab === 'share'} onClick={() => setActiveTab('share')}>
                Share
              </Tab>
              <Tab active={activeTab === 'teams'} onClick={() => setActiveTab('teams')}>
                Teams
              </Tab>
            </Tabs>
            <TabContent>
              {activeTab === 'logs' && LoggingPanel(logs)}
              {activeTab === 'ai' && <AIAssistantUI />}
              {activeTab === 'timeline' && <div>Timeline content goes here.</div>}
              {activeTab === 'prefabs' && <div>Prefabs content goes here.</div>}
              {activeTab === 'tests' && <div>Tests content goes here.</div>}
              {activeTab === 'share' && <div>Share content goes here.</div>}
              {activeTab === 'teams' && <div>Teams content goes here.</div>}
            </TabContent>
          </>
        )}
        {minimized && <MinimizedTitle>Click button to expand</MinimizedTitle>}
      </Panel>
      <ToggleButton onClick={onToggle}>{minimized ? '▲' : '▼'}</ToggleButton>
    </>
  );
};

export default BottomPanelContainer;

