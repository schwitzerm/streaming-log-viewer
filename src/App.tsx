import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import TerminalInput from './components/TerminalInput';
import LogLine from './components/LogLine';
import FilterControls from './components/FilterControls';
import ClientsPanel from './components/ClientsPanel';
import {FilterOptions, LogMessage, LogLevel} from "./types";
import {WebSocketProvider, useWebSocket} from './hooks/useWebSocket';

const AppContent: React.FC = () => {
  // Get WebSocket context data
  const { clients, logs: wsLogs, sendCommand } = useWebSocket();

  // State for selected client for highlighting
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [logs, setLogs] = useState<LogMessage[]>([
    {
      timestamp: new Date().toISOString(),
      clientId: "system-init",
      level: 'info',
      message: 'Terminal started. Type a command to begin.',
      id: "init-1"
    }
  ]);

  // Merge logs from WebSocket
  useEffect(() => {
    if (wsLogs.length > 0) {
      setLogs(prevLogs => [...wsLogs, ...prevLogs]);
    }
  }, [wsLogs]);

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    appliedSearch: '',
    selectedLevels: {
      'info': false,
      'warn': false,
      'error': false,
      'debug': false,
      'trace': false
    },
    client: 'all',
    active: false
  });

  // Handle client selection for highlighting
  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(prevId => prevId === clientId ? null : clientId);
  };

  const handleCommand = (command: string) => {
    // Add a new log entry for the command
    const newLog: LogMessage = {
      timestamp: new Date().toISOString(),
      clientId: "local-user",
      level: 'debug',
      message: `$ ${command}`,
      id: `cmd-${Date.now()}`
    };

    setLogs(prevLogs => [newLog, ...prevLogs]);

    // Process the command
    if (command.startsWith('/send ') && selectedClientId) {
      // Format: /send <message>
      const message = command.substring(6);
      sendCommand(selectedClientId, message);
    } else if (command.startsWith('/broadcast ')) {
      // Format: /broadcast <message>
      const message = command.substring(11);
      // Add a log message about broadcasting
      const broadcastLog: LogMessage = {
        timestamp: new Date().toISOString(),
        clientId: "system",
        level: 'info',
        message: `Broadcasting to all clients: ${message}`,
        id: `broadcast-${Date.now()}`
      };
      setLogs(prevLogs => [broadcastLog, ...prevLogs]);

      // Broadcast to all clients
      clients.forEach(client => {
        sendCommand(client.id, message);
      });
    } else {
      // For other commands or if no client is selected, show help
      const responseLog: LogMessage = {
        timestamp: new Date().toISOString(),
        clientId: "system",
        level: 'info',
        message: `Available commands:
  /send <message> - Send message to selected client
  /broadcast <message> - Send message to all clients`,
        id: `resp-${Date.now()}`
      };
      setLogs(prevLogs => [responseLog, ...prevLogs]);
    }
  };

  // Function to handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    // Only recalculate the active flag if it wasn't explicitly set by a toggle
    if (newFilters.active === filters.active) {
      // Check if any level is selected or if there's an applied search term
      const hasSelectedLevels = Object.values(newFilters.selectedLevels).some(selected => selected);
      const isActive =
        hasSelectedLevels ||
        newFilters.appliedSearch.trim() !== '';

      setFilters({
        ...newFilters,
        active: isActive
      });
    } else {
      // If active was explicitly changed, respect the passed value
      setFilters(newFilters);
    }
  };

  // Apply filters to logs
  const filteredLogs = logs.filter(log => {
    // If filters are not active, show all logs
    if (!filters.active) {
      return true;
    }

    // Check for client filter in search text
    const clientRegex = /#client:([^\s]+)/;
    const clientMatch = filters.appliedSearch.match(clientRegex);

    let searchText = filters.appliedSearch;
    let clientFilter = null;

    // If we found a client filter, extract it
    if (clientMatch) {
      clientFilter = clientMatch[1];
      // Remove the client filter from the search text
      searchText = filters.appliedSearch.replace(clientRegex, '').trim();
    }

    // Filter by client if specified
    if (clientFilter && log.clientId !== clientFilter) {
      return false;
    }

    // Filter by search text (without the client filter part if it exists)
    if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // Filter by log level - check if any selected level matches (OR logic)
    const hasSelectedLevels = Object.values(filters.selectedLevels).some(selected => selected);
    if (hasSelectedLevels && !filters.selectedLevels[log.level]) {
      return false;
    }

    return true;
  });

  // Handle clicking on a client ID to filter logs by that client
  const handleClientFilter = (clientId: string) => {
    const newSearch = `#client:${clientId}`;
    const newFilters = {
      ...filters,
      search: newSearch,
      appliedSearch: newSearch,
      active: true
    };

    handleFilterChange(newFilters);
  };

  // Handle clicking on a log level badge to toggle filtering by that level
  const handleLevelFilter = (level: string) => {
    // Create a copy of the selected levels and toggle the clicked level
    const newSelectedLevels = {
      ...filters.selectedLevels,
      [level as LogLevel]: !filters.selectedLevels[level as LogLevel]
    };

    // Create new filters with the updated selected levels
    const newFilters = {
      ...filters,
      selectedLevels: newSelectedLevels,
      active: true
    };

    // Apply the new filters
    handleFilterChange(newFilters);
  };

  const [isClientsPanelCollapsed, setIsClientsPanelCollapsed] = useState(false);

  return (
    <AppContainer>
      <TerminalLayout>
        <TerminalWindow>
          <TerminalHeader>
            <TerminalTitle>Tarky Terminal</TerminalTitle>
            <FilterControls filters={filters} onFilterChange={handleFilterChange} />
          </TerminalHeader>
          <LogsContainer>
            {filteredLogs.map((log, index) => (
              <LogLine
                key={log.id || index}
                log={log}
                onClientClick={handleClientFilter}
                onLevelClick={handleLevelFilter}
                isHighlighted={selectedClientId !== null && log.clientId === selectedClientId}
              />
            ))}
          </LogsContainer>
          <TerminalInput onSubmit={handleCommand} />
        </TerminalWindow>
        <ClientsPanel
          clients={clients}
          selectedClientId={selectedClientId}
          onClientSelect={handleClientSelect}
          initialCollapsed={isClientsPanelCollapsed}
          onCollapsedStateChange={setIsClientsPanelCollapsed}
        />
      </TerminalLayout>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
  overflow: hidden;
`;

const TerminalLayout = styled.div`
  display: flex;
  flex: 1;
  height: 100%;
  gap: 0;
  position: relative;
`;


const TerminalWindow = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: ${({ theme }) => theme.terminalBackground};
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid ${({ theme }) => theme.border};
  border-right: none;
  min-width: 0; /* Prevent flex item from overflowing */
`;

const TerminalHeader = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 10px 15px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 10px;
`;

const TerminalTitle = styled.div`
  color: ${({ theme }) => theme.text};
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  font-weight: 500;
  margin-right: 20px;
`;

const LogsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column-reverse;
`;

const App: React.FC = () => {
  return (
    <WebSocketProvider>
      <AppContent />
    </WebSocketProvider>
  );
};

export default App;
