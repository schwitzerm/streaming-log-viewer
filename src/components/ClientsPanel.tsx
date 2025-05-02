import React, { useState, FormEvent } from 'react';
import styled from 'styled-components';
import { Client } from '../types';

interface ClientsPanelProps {
  clients: Client[];
  selectedClientId: string | null;
  onClientSelect: (clientId: string) => void;
  onCollapsedStateChange?: (isCollapsed: boolean) => void;
  initialCollapsed?: boolean;
}

interface CommandInputProps {
  isPanelOpen: boolean;
  onSendCommand?: (command: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ isPanelOpen, onSendCommand }) => {
  const [command, setCommand] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (command.trim() && onSendCommand) {
      onSendCommand(command);
      setCommand('');
    }
  };

  return (
    <CommandForm onSubmit={handleSubmit} isPanelOpen={isPanelOpen}>
      <CommandInputField
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        placeholder="Enter command..."
        disabled={!isPanelOpen}
      />
      <CommandButton type="submit" disabled={!isPanelOpen || !command.trim()}>
        Send
      </CommandButton>
    </CommandForm>
  );
};

const CommandForm = styled.form<{ isPanelOpen: boolean }>`
  display: flex;
  padding: 10px;
  background-color: ${({ theme }) => theme.terminalBackground};
  border-top: 1px solid ${({ theme }) => theme.border};
  opacity: ${props => props.isPanelOpen ? 1 : 0.7};
  transition: opacity 0.2s ease;
`;

const CommandInputField = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary}50;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const CommandButton = styled.button`
  margin-left: 8px;
  padding: 8px 12px;
  background-color: ${({ theme }) => theme.primary};
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primaryHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClientsPanel: React.FC<ClientsPanelProps> = ({
  clients,
  selectedClientId,
  onClientSelect,
  onCollapsedStateChange,
  initialCollapsed = false
}) => {
  // Start with panel expanded for first-time users to make it discoverable
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    if (onCollapsedStateChange) {
      onCollapsedStateChange(newCollapsedState);
    }
  };

  return (
    <ClientsPanelContainer isCollapsed={isCollapsed}>
      <SidebarContent>
        <PanelHeader>
          <PanelTitle>Connected Clients ({clients.length})</PanelTitle>
        </PanelHeader>

        <ClientsList>
          {clients.length === 0 ? (
            <NoClientsMessage>No clients connected</NoClientsMessage>
          ) : (
            clients.map(client => (
              <ClientItem
                key={client.id}
                isSelected={client.id === selectedClientId}
                onClick={() => onClientSelect(client.id)}
                title={`Click to highlight logs from ${client.name || client.id}`}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onClientSelect(client.id)}
              >
                <ClientName>{client.name || `Client-${client.id.substring(0, 6)}`}</ClientName>
                <ClientStatus isConnected={client.connected}>
                  {client.connected ? 'Connected' : 'Disconnected'}
                </ClientStatus>
              </ClientItem>
            ))
          )}
        </ClientsList>
        <ToggleButton onClick={toggleCollapse} isCollapsed={isCollapsed}>
          <CollapseIcon isCollapsed={isCollapsed}>
            {isCollapsed ? '◀' : '▶'}
          </CollapseIcon>
        </ToggleButton>
      </SidebarContent>
    </ClientsPanelContainer>
  );
};

const ClientsPanelContainer = styled.div<{ isCollapsed: boolean }>`
  width: ${props => props.isCollapsed ? '0' : '250px'};
  height: 100%;
  background-color: ${({ theme }) => theme.background};
  border-left: 1px solid ${({ theme }) => theme.border};
  border-top: 1px solid ${({ theme }) => theme.border};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  border-right: 1px solid ${({ theme }) => theme.border};
  overflow: hidden;
  display: flex;
  flex-shrink: 0;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
  transition: width 0.3s ease-in-out, opacity 0.3s ease;
  opacity: ${props => props.isCollapsed ? '0' : '1'};
  position: relative;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100%;
  padding: 0px 0;
  overflow: hidden;
`;

const ToggleButton = styled.div<{ isCollapsed: boolean }>`
  position: absolute;
  top: 50%;
  left: ${props => props.isCollapsed ? '0' : 'auto'};
  right: ${props => props.isCollapsed ? 'auto' : '100%'};
  width: 30px;
  height: 60px;
  transform: translateY(-50%);
  background-color: ${({ theme }) => theme.terminalBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-right: ${props => props.isCollapsed ? '1px' : '0'} solid ${({ theme }) => theme.border};
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1100; /* Ensure it's above other content */
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);

  &:hover {
    background-color: ${({ theme }) => theme.highlight};
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 15px;
  background-color: ${({ theme }) => theme.terminalBackground};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  user-select: none;
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const CollapseIcon = styled.span<{ isCollapsed: boolean }>`
  color: ${({ theme }) => theme.cyan}; /* Using a more noticeable color */
  font-size: 18px;
  font-weight: bold;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClientsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
`;

const ClientItem = styled.li<{ isSelected: boolean }>`
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border}33;
  background-color: ${({ isSelected }) => 
    isSelected ? 'rgba(255, 121, 198, 0.133)' : 'transparent'};

  &:hover {
    background-color: ${({ isSelected, theme }) => 
      isSelected ? 'rgba(255, 121, 198, 0.2)' : theme.highlight};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.primary};
    outline-offset: -2px;
  }
`;

const ClientName = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 13px;
  font-weight: 500;
`;

const ClientStatus = styled.span<{ isConnected: boolean }>`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: ${({ isConnected, theme }) => 
    isConnected ? `${theme.success}22` : `${theme.error}22`};
  color: ${({ isConnected, theme }) => 
    isConnected ? theme.success : theme.error};
`;

const NoClientsMessage = styled.div`
  padding: 15px;
  text-align: center;
  color: ${({ theme }) => theme.mutedText};
  font-style: italic;
  font-size: 13px;
`;

export default ClientsPanel;
