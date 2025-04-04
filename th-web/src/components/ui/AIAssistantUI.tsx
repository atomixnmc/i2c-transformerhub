import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from './CommonUI';
import { FaEllipsisV, FaRobot } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - var(--bottom-panel-height, 0px)); /* Adjust height dynamically */
  transition: height 0.3s ease; /* Smooth resizing */
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between; /* Align items to edges */
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: #f1f3f5;
  border-bottom: 1px solid #dee2e6;
`;

const ToolbarButton = styled.button<{ active: boolean }>`
  padding: 6px 12px;
  background-color: ${props => (props.active ? '#007bff' : '#e9ecef')};
  color: ${props => (props.active ? 'white' : '#495057')};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${props => (props.active ? '#0056b3' : '#d6d8db')};
  }
`;

const DropdownMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  right: 0;
  background-color: white;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
  width: 180px; /* Set minimum width */

  ${DropdownMenu}:hover & {
    display: block;
  }
`;

const DropdownItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #495057;

  &:hover {
    background-color: #f1f3f5;
  }
`;

const ChatPanel = styled.div`
  flex: 1;
  overflow-y: auto; /* Make scrollable */
  padding: 8px;
  background-color: #f8f9fa;
  height: 400px; /* Fixed height */
`;

const ChatMessage = styled.div<{ isUser: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  text-align: ${props => (props.isUser ? 'right' : 'left')};
  color: ${props => (props.isUser ? '#007bff' : '#495057')};
  flex-direction: ${props => (props.isUser ? 'row-reverse' : 'row')};
`;

const Avatar = styled.div<{ isUser: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${props => (props.isUser ? '#007bff' : '#6c757d')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin: 0 8px;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #28a745;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: ${keyframes`
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  `} 1s linear infinite;
`;

const InputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid #dee2e6;
  background-color: #f8f9fa;
`;

const TextArea = styled.textarea`
  flex: 1;
  padding: 8px;
  border: 1px solid #e0e0e0; /* Very light gray border */
  border-radius: 8px; /* Rounded corners */
  resize: none;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  margin: 4px;
  border: 1px solid #007bff;
  border-radius: 16px;
  background-color: white;
  color: #007bff;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background-color: #007bff;
    color: white;
  }
`;

const TabTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #495057;
`;

const AIAssistantUI: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('GPT-3');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; isThinking?: boolean; actions?: string[] }[]>([
    { text: 'What can I help you?', isUser: false }
  ]);
  const [input, setInput] = useState<string>('');

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        { text: input, isUser: true },
        { text: '', isUser: false, isThinking: true }
      ]);
      setInput('');

      // Simulate AI response
      setTimeout(() => {
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          updatedMessages[updatedMessages.length - 1] = {
            text: `Response from ${selectedModel}`,
            isUser: false,
            actions: ['Action 1', 'Action 2']
          };
          return updatedMessages;
        });
      }, 2000);
    }
  };

  const handleClearChat = () => {
    setMessages([{ text: 'What can I help you?', isUser: false }]);
  };

  return (
    <Container>
      <Toolbar>
        <TabTitle>
          <FaRobot /> AI Assistant
        </TabTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['GPT-3', 'GPT-4', 'Custom Model'].map(model => (
            <ToolbarButton
              key={model}
              active={selectedModel === model}
              onClick={() => setSelectedModel(model)}
            >
              {model}
            </ToolbarButton>
          ))}
          <DropdownMenu>
            <FaEllipsisV />
            <DropdownContent>
              <DropdownItem>Context</DropdownItem>
              <DropdownItem>Download</DropdownItem>
              <DropdownItem>Auto mode</DropdownItem>
            </DropdownContent>
          </DropdownMenu>
        </div>
      </Toolbar>
      <ChatPanel>
        {messages.map((message, index) => (
          <ChatMessage key={index} isUser={message.isUser}>
            <Avatar isUser={message.isUser}>{message.isUser ? 'U' : 'AI'}</Avatar>
            {message.isThinking ? (
              <Spinner />
            ) : (
              <>
                <div>{message.text}</div>
                {message.actions && (
                  <div>
                    {message.actions.map((action, i) => (
                      <ActionButton key={i}>{action}</ActionButton>
                    ))}
                  </div>
                )}
              </>
            )}
          </ChatMessage>
        ))}
      </ChatPanel>
      <InputContainer>
        <TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <Button onClick={handleSendMessage}>Chat</Button>
        <Button className="secondary" onClick={handleClearChat}>
          Clear
        </Button>
      </InputContainer>
    </Container>
  );
};

export default AIAssistantUI;
