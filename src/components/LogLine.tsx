import React, { memo } from 'react';
import styled from 'styled-components';
import { LogMessage } from '../types';
import { getLevelColor } from '../utils/logUtils';

interface LogLineProps {
  log: LogMessage;
  onClientClick?: (clientId: string) => void;
  onLevelClick?: (level: string) => void;
  isHighlighted?: boolean;
}

const LogLine: React.FC<LogLineProps> = ({ log, onClientClick, onLevelClick, isHighlighted = false }) => {
  // Try to parse the timestamp, with error handling
  let timestamp;
  try {
    timestamp = new Date(log.timestamp).toLocaleTimeString();
  } catch (error) {
    timestamp = 'Invalid time';
    console.error('Error parsing timestamp:', error);
  }

  const handleClientClick = () => {
    if (onClientClick) {
      onClientClick(log.clientId);
    }
  };

  const handleLevelClick = () => {
    if (onLevelClick) {
      onLevelClick(log.level);
    }
  };

  return (
    <LogLineContainer
      level={log.level}
      isHighlighted={isHighlighted}
      role="row"
      aria-label={`Log entry: ${log.level} from ${log.clientId}`}
    >
      <LogTimestamp role="cell" aria-label="Timestamp">{timestamp}</LogTimestamp>
      <LogClientId
        onClick={handleClientClick}
        $clickable={!!onClientClick}
        title={`Click to filter by client: ${log.clientId}`}
        role="cell"
        aria-label={`Client: ${log.clientId}`}
        tabIndex={onClientClick ? 0 : undefined}
        onKeyPress={(e) => e.key === 'Enter' && handleClientClick()}
      >
        {log.clientId.length > 30 ? `${log.clientId.substring(0, 27)}...` : log.clientId}
      </LogClientId>
      <LogLevel
        level={log.level}
        onClick={handleLevelClick}
        $clickable={!!onLevelClick}
        title={`Click to filter by ${log.level} log level`}
        role="cell"
        aria-label={`Log level: ${log.level}`}
        tabIndex={onLevelClick ? 0 : undefined}
        onKeyPress={(e) => e.key === 'Enter' && handleLevelClick()}
      >
        {log.level}
      </LogLevel>
      <LogText role="cell">{log.message}</LogText>
    </LogLineContainer>
  );
};

const LogLineContainer = styled.div<{ level: LogMessage['level'], isHighlighted?: boolean }>`
  display: flex;
  padding: 4px 0;
  font-family: 'Fira Code', monospace;
  line-height: 1.5;
  border-bottom: 1px solid ${({ theme }) => theme.border}33;
  background-color: ${({ isHighlighted, theme }) => 
    isHighlighted ? theme.highlight : 'transparent'};

  &:hover {
    background-color: ${({ isHighlighted, theme }) => 
      isHighlighted ? `${theme.highlight}dd` : theme.background};
  }
`;

const LogTimestamp = styled.span`
  color: ${({ theme }) => theme.infoText};
  margin-right: 12px;
  user-select: none;
  min-width: 90px;
`;

const LogClientId = styled.span<{ $clickable?: boolean }>`
  color: ${({ theme }) => theme.blue};
  margin-right: 12px;
  text-align: right;
  user-select: none;
  min-width: 240px;
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};

  ${({ $clickable }) => $clickable && `
    &:hover {
      text-decoration: underline;
      font-weight: bold;
    }
  `}
`;


const LogLevel = styled.span<{ level: LogMessage['level'], $clickable?: boolean }>`
  color: ${({ level, theme }) => getLevelColor(level, theme)};
  background-color: ${({ level, theme }) => `${getLevelColor(level, theme)}22`};
  margin-right: 12px;
  padding: 1px 6px;
  border-radius: 3px;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};

  ${({ $clickable }) => $clickable && `
    &:hover {
      filter: brightness(110%);
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
    }
  `}
`;

const LogText = styled.span`
  color: ${({ theme }) => theme.text};
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
`;

// Memoize the component to prevent unnecessary re-renders
export default memo(LogLine);
