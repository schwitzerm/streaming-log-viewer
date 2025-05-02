# Real-Time Logging System

A web-based application for monitoring and interacting with distributed clients in real-time via WebSockets.

## Overview

This application provides a centralized dashboard for monitoring log messages from multiple connected clients in
real-time. It also supports sending commands to individual clients, making it useful for remote monitoring, debugging,
and control scenarios.

## Features

- **Real-time Log Monitoring**: View logs from multiple clients in a single interface
- **Centralized Command Control**: Send commands to any connected client
- **Connection Status Tracking**: Monitor which clients are connected
- **Log Level Filtering**: Filter logs by severity levels (info, warning, error, etc.)
- **Client Identification**: Each client receives a unique UUID and can provide a human-readable name for easy identification

## Architecture

The application consists of three main components:

1. **WebSocket Server**: Node.js server handling client connections and message routing
2. **Web Dashboard**: React-based UI for monitoring logs and sending commands
3. **Client SDK**: Library for client applications to connect and send logs

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

This will concurrently launch both the WebSocket server and the React frontend.

- Frontend: http://localhost:3000
- WebSocket Server: http://localhost:3001

## Usage

### Viewing Logs

The main dashboard displays real-time logs from all connected clients. Each log entry shows:

- Timestamp
- Client ID
- Log level (info, warning, error, etc.)
- Message content
