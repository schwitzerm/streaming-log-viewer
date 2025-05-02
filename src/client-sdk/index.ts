import { io, Socket } from 'socket.io-client';
import { LogLevel } from '../types';

export default class LogClient {
  private socket: Socket;
  private clientId: string | null = null;
  private clientName: string | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'http://localhost:3001', clientName?: string) {
    this.serverUrl = serverUrl;
    this.clientName = clientName || null;
    this.socket = io(serverUrl, {
      path: '/socket.io/', // Match the path set in the server
      transports: ['websocket']
    });

    // Set up event handlers
    this.socket.on('client-id', (id: string) => {
      this.clientId = id;
      console.log(`Connected to log server with ID: ${id}`);

      // Register client name if provided
      if (this.clientName && this.clientId) {
        this.registerName(this.clientName);
      }
    });

    this.socket.on('command-for-client', (data: any) => {
      if (data.targetClientId === this.clientId) {
        console.log(`Received command: ${data.command}`);
        // Emit an event that the application can listen for
        this.onCommand(data.command, data.commandId);
      }
    });
  }

  // Method to be overridden by the application
  onCommand(command: string, commandId: string): void {
    // Default implementation logs the command
    console.log(`Received command: ${command} (ID: ${commandId})`);

    // Send a generic response
    this.respondToCommand(commandId, `Command '${command}' acknowledged by ${this.clientId}`, true);
  }

  // Send a response to a command
  respondToCommand(commandId: string, response: string, success: boolean = true): void {
    if (!this.clientId) {
      console.warn('Not connected to log server yet');
      return;
    }

    this.socket.emit('command-response', {
      commandId,
      clientId: this.clientId,
      response,
      success,
      timestamp: new Date().toISOString()
    });

    // Also log the response
    this.log(success ? 'info' : 'error', `Response: ${response}`);
  }

  // Register or update the client's human-readable name
  registerName(name: string): void {
    if (!this.clientId) {
      // Store name and register it when we get a client ID
      this.clientName = name;
      return;
    }

    this.clientName = name;
    this.socket.emit('register-name', {
      clientId: this.clientId,
      name: name
    });
  }

  log(level: LogLevel, message: string, metadata: object = {}): void {
    if (!this.clientId) {
      console.warn('Not connected to log server yet');
      return;
    }

    this.socket.emit('log-message', {
      clientId: this.clientId,
      level,
      message,
      metadata,
      timestamp: new Date().toISOString()
    });
  }

  info(message: string, metadata: object = {}): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata: object = {}): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata: object = {}): void {
    this.log('error', message, metadata);
  }

  debug(message: string, metadata: object = {}): void {
    this.log('debug', message, metadata);
  }

  trace(message: string, metadata: object = {}): void {
    this.log('trace', message, metadata);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  isConnected(): boolean {
    return this.socket.connected && this.clientId !== null;
  }

  getClientId(): string | null {
    return this.clientId;
  }

  getClientName(): string | null {
    return this.clientName;
  }
}
