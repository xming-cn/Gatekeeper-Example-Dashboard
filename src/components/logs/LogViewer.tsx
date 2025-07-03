'use client';

import { useEffect, useRef, useState } from 'react';
import { getStoredToken } from '@/lib/api';

// Function to remove ANSI color codes from log messages
const stripAnsiCodes = (text: string | unknown): string => {
  if (typeof text !== 'string') return '';
  return text.replace(/\x1b\[\d+(;\d+)*m/g, '').replace(/\[\d+(;\d+)*m/g, '');
};

export default function LogViewer() {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<number | undefined>(undefined);

  // Function to create WebSocket connection
  const createWebSocket = () => {
    const token = getStoredToken();
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket('ws://127.0.0.1:8080/ws/gatekeeper/logger');

    ws.onopen = () => {
      const authData = {
        type: "auth",
        token: token
      };
      ws.send(JSON.stringify(authData));
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'auth_ok') {
          setConnected(true);
          setError(null);
          return;
        }
        if (data.type === 'pong') return;
        if (typeof event.data === 'string') {
          setLogs(prev => [...prev, stripAnsiCodes(event.data)]);
        }
      } catch (err) {
        // If parsing fails, treat it as a raw log message
        const message = stripAnsiCodes(event.data);
        if (message.trim()) {
          setLogs(prev => [...prev, message]);
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
      setConnected(false);
      // Clear existing connection
      wsRef.current = null;
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {  // Only handle if this is still the current connection
        setConnected(false);
        setError('Connection closed, reconnecting...');
        // Try to reconnect after 1 second
        reconnectTimeoutRef.current = window.setTimeout(createWebSocket, 1000);
      }
    };

    wsRef.current = ws;
  };


  useEffect(() => {
    createWebSocket();

    // Cleanup function
    return () => {
      const ws = wsRef.current;
      if (ws) {
        // Remove all listeners before closing
        ws.onclose = null;
        ws.onerror = null;
        ws.onmessage = null;
        ws.onopen = null;
        ws.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current !== undefined) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = undefined;
      }
    };
  }, []);

  // Add a ping interval to keep the connection alive
  useEffect(() => {
    if (!connected) return;

    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds

    return () => {
      clearInterval(pingInterval);
    };
  }, [connected]);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      const logContainer = logsEndRef.current.parentElement?.parentElement;
      if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  }, [logs]);

  return (
  <div className="space-y-2" style={{ contain: 'paint layout' }}>
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-600">
          {error || (connected ? 'Connected' : 'Connecting...')}
        </span>
      </div>
      <div className="bg-black text-white font-mono text-sm p-4 rounded-lg fixed-height overflow-y-auto scrollbar-thin">
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {log}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  </div>
  );
}
