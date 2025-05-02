import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { LogMessage, FilterOptions, LogLevel, Client } from '../types';
import LogLine from './LogLine';
import TerminalInput from './TerminalInput';
import { getLevelColor } from '../utils/logUtils';

interface TerminalProps {
  logs: LogMessage[];
  clients: Client[];
  onSendCommand: (clientId: string, command: string) => void;
  onClearLogs: () => void;
}

const Terminal: React.FC<TerminalProps> = ({
  logs,
  clients,
  onSendCommand,
  onClearLogs
}) => {
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
  const [activeClientId, setActiveClientId] = useState<string>('all');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Memoize filtered logs to prevent recalculation on every render
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Skip filtering if filters are not active
      if (!filters.active) return true;

      // Filter by search term
      if (filters.appliedSearch && !log.message.toLowerCase().includes(filters.appliedSearch.toLowerCase())) {
        return false;
      }

      // Filter by log level - check if any levels are selected, and if so, verify the log's level is one of them
      const hasSelectedLevels = Object.values(filters.selectedLevels).some(selected => selected);
      if (hasSelectedLevels && !filters.selectedLevels[log.level]) {
        return false;
      }

      // Filter by client
      if (filters.client !== 'all' && log.clientId !== filters.client) {
        return false;
      }

      return true;
    });
  }, [logs, filters.active, filters.appliedSearch, filters.selectedLevels, filters.client]);

  // Memoize event handlers to prevent recreation on every render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilters(prev => ({ ...prev, appliedSearch: prev.search }));
    }
  }, []);

  const handleLevelToggle = useCallback((level: LogLevel) => {
    setFilters(prev => {
      // Toggle the selected state for this level
      const newSelectedLevels = {
        ...prev.selectedLevels,
        [level]: !prev.selectedLevels[level]
      };

      // Update filters with the new selection
      return { 
        ...prev, 
        selectedLevels: newSelectedLevels,
        // Automatically activate filters if any level is selected
        active: Object.values(newSelectedLevels).some(selected => selected) || prev.search !== ''
      };
    });
  }, []);

  const handleClientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = e.target.value;
    setFilters(prev => ({ ...prev, client: clientId }));
    setActiveClientId(clientId);
  }, []);

  const handleClientClick = useCallback((clientId: string) => {
    setFilters(prev => ({ ...prev, client: clientId, active: true }));
    setActiveClientId(clientId);
  }, []);

  const handleLevelClick = useCallback((level: string) => {
    setFilters(prev => {
      const newSelectedLevels = {
        ...prev.selectedLevels,
        [level as LogLevel]: true
      };
      return {
        ...prev,
        selectedLevels: newSelectedLevels,
        active: true
      };
    });
  }, []);

  const handleSendCommand = useCallback((command: string) => {
    if (activeClientId === 'all') {
      // Replace alert with a more user-friendly approach
      setCommandError('Please select a specific client to send a command to');
      setTimeout(() => setCommandError(''), 3000);
    } else {
      onSendCommand(activeClientId, command);
    }
  }, [activeClientId, onSendCommand]);

  // State for command error message
  const [commandError, setCommandError] = useState<string>('');

  return (
    <TerminalContainer>
      <TerminalHeader>
        <TerminalTitle>Terminal Log Viewer</TerminalTitle>
        <FiltersContainer role="toolbar" aria-label="Log filtering options">
          <FilterGroup>
            <FilterLabel htmlFor="log-search">Search:</FilterLabel>
            <SearchInput 
              id="log-search"
              type="text" 
              value={filters.search} 
              onChange={handleSearchChange} 
              onKeyDown={handleSearchKeyDown}
              placeholder="Filter logs..." 
              aria-label="Search logs"
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel id="level-filter-label">Level:</FilterLabel>
            <LevelBadgesContainer role="group" aria-labelledby="level-filter-label">
              {Object.keys(filters.selectedLevels).map((level) => (
                <LevelBadge 
                  key={level}
                  level={level as LogLevel}
                  $active={filters.selectedLevels[level as LogLevel]}
                  onClick={() => handleLevelToggle(level as LogLevel)}
                  role="checkbox"
                  aria-checked={filters.selectedLevels[level as LogLevel]}
                  aria-label={`${level} log level filter`}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleLevelToggle(level as LogLevel)}
                >
                  {level.toUpperCase()}
                </LevelBadge>
              ))}
            </LevelBadgesContainer>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="client-select">Client:</FilterLabel>
            <FilterSelect 
              id="client-select"
              value={filters.client} 
              onChange={handleClientChange}
              aria-label="Select client to filter logs"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name || 'Unknown'} ({client.id.substring(0, 6)})
                </option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <ClearButton 
            onClick={onClearLogs}
            aria-label="Clear all logs"
          >
            Clear Logs
          </ClearButton>
        </FiltersContainer>
      </TerminalHeader>

      <TerminalContent 
        ref={terminalRef}
        role="log"
        aria-label="Log messages"
        aria-live="polite"
      >
        {filteredLogs.length === 0 ? (
          <EmptyState role="status" aria-live="polite">
            <EmptyIcon aria-hidden="true">⌨️</EmptyIcon>
            <EmptyText>No logs to display. Connect clients to view logs.</EmptyText>
          </EmptyState>
        ) : (
          filteredLogs.map(log => (
            <LogLine 
              key={log.id} 
              log={log} 
              onClientClick={handleClientClick}
              onLevelClick={handleLevelClick}
            />
          ))
        )}
      </TerminalContent>

      <TerminalFooter>
        <ClientStatus role="status" aria-live="polite">
          {clients.length} client{clients.length !== 1 ? 's' : ''} connected
        </ClientStatus>

        {commandError && (
          <CommandError role="alert" aria-live="assertive">
            {commandError}
          </CommandError>
        )}

        <TerminalInput 
          onSubmit={handleSendCommand}
          disabled={activeClientId === 'all'}
          placeholder={activeClientId === 'all' 
            ? "Select a client to send commands..." 
            : `Send command to ${
                clients.find(c => c.id === activeClientId)?.name || activeClientId.substring(0, 8)
              }`}
        />
      </TerminalFooter>
    </TerminalContainer>
  );
};

// Styling
const blinkAnimation = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const TerminalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.terminalBackground};
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const TerminalHeader = styled.div`
  background-color: ${({ theme }) => theme.background};
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const TerminalTitle = styled.h1`
  font-size: 18px;
  color: ${({ theme }) => theme.primary};
  margin: 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 12px;
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterLabel = styled.label`
  color: ${({ theme }) => theme.infoText};
  font-size: 12px;
`;

const FilterInputStyles = css`
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  padding: 6px 10px;
  font-family: inherit;
  font-size: 12px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px rgba(136, 221, 255, 0.2);
  }
`;

const SearchInput = styled.input`
  ${FilterInputStyles};
  width: 200px;
`;

const FilterSelect = styled.select`
  ${FilterInputStyles};
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2382AAFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  padding-right: 28px;
  min-width: 140px;
`;

const ClearButton = styled.button`
  ${FilterInputStyles};
  cursor: pointer;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.error};
  border-color: ${({ theme }) => theme.error};
  margin-left: auto;

  &:hover {
    background-color: ${({ theme }) => theme.error};
    color: white;
  }
`;

const TerminalContent = styled.div`
  flex: 1;
  padding: 12px 16px;
  overflow-y: auto;
  font-family: 'Fira Code', monospace;
  color: ${({ theme }) => theme.text};
`;

const TerminalFooter = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.background};
  padding: 8px 16px 16px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const ClientStatus = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.infoText};
  margin-bottom: 8px;
`;

const CommandError = styled.div`
  background-color: ${({ theme }) => theme.red}22;
  color: ${({ theme }) => theme.red};
  border: 1px solid ${({ theme }) => theme.red};
  border-radius: 4px;
  padding: 6px 12px;
  margin-bottom: 8px;
  font-size: 13px;
  text-align: center;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.infoText};
  opacity: 0.7;
  padding: 20px;
`;

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  text-align: center;
  line-height: 1.5;
`;

const LevelBadgesContainer = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;


const LevelBadge = styled.div<{ level: LogLevel, $active: boolean }>`
  color: ${({ level, theme, $active }) => $active ? '#fff' : getLevelColor(level, theme)};
  background-color: ${({ level, theme, $active }) => 
    $active ? getLevelColor(level, theme) : `${getLevelColor(level, theme)}22`};
  border: 1px solid ${({ level, theme }) => getLevelColor(level, theme)};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(110%);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  }
`;

export default Terminal;
