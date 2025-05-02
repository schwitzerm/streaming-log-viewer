export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'trace';

export interface LogMessage {
  clientId: string;       // UUID of the client
  clientName?: string;    // Human-readable name of the client
  message: string;
  level: LogLevel;
  timestamp: string | number;
  id?: string;
}

export interface Client {
  id: string;          // System-assigned UUID for tracking
  name: string;        // Human-readable identifier provided by client
  connected: boolean;
  lastSeen?: string;
}

export interface Command {
  clientId: string;
  command: string;
  timestamp: string;
  id: string;
  name: string;
  connected: boolean;
}

export interface FilterOptions {
  search: string;
  appliedSearch: string;
  selectedLevels: Record<LogLevel, boolean>;
  client: string;
  active: boolean;
}