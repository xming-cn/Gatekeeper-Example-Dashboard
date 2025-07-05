'use client';

import { useEffect, useRef, useState } from 'react';
import { getStoredToken, getServerAddress } from '@/lib/api';
import SimpleCommandPanel from '@/components/command/SimpleCommandPanel';
import { AnsiUp } from 'ansi_up';

const ansi_up = new AnsiUp();

// Function to remove ANSI color codes from log messages
const parseAnsiCodes = (text: string | unknown): string => {
  if (typeof text !== 'string') return '';
  return ansi_up.ansi_to_html(text as string);
};

// const stripAnsiCodes = (text: string): string => {
//   if (typeof text !== 'string') return '';
//   return text.replace(/\x1b\[\d+(;\d+)*m/g, '').replace(/\[\d+(;\d+)*m/g, '');
// }

interface LogViewerProps {
  onExpandChange?: (expanded: boolean) => void;
}

export default function LogViewer({ onExpandChange }: LogViewerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    onExpandChange?.(expanded);
  }, [expanded, onExpandChange]);
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

    const ws = new WebSocket(`wss://${getServerAddress()}/ws/gatekeeper/logger`);

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
          setLogs(prev => {
            const newLogs = [...prev, parseAnsiCodes(event.data)];
            return newLogs.length > 400 ? newLogs.slice(-400) : newLogs;
          });
        }
      } catch {
        // If parsing fails, treat it as a raw log message
        const message = parseAnsiCodes(event.data);
        if (message.trim()) {
          setLogs(prev => {
            const newLogs = [...prev, message];
            return newLogs.length > 400 ? newLogs.slice(-400) : newLogs;
          });
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
  <div className={`space-y-2 transition-all duration-200 ${
    expanded ? 'fixed inset-0 bg-white z-50 p-4 pt-4' : ''
  }`} style={{ contain: 'paint layout' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {error || (connected ? 'Connected' : 'Connecting...')}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div 
        className={`bg-black text-white font-mono text-sm p-4 rounded-lg overflow-y-auto scrollbar-thin transition-all duration-200 ${
          expanded ? 'h-[calc(100vh-10rem)]' : 'fixed-height'
        }`}
      >
      <div className="space-y-1">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className="whitespace-pre-wrap" 
            dangerouslySetInnerHTML={{ __html: log }}
          />
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>

    {/* Command Panel in expanded mode - positioned below logs */}
    {expanded && (
      <div className="mt-4">
        <SimpleCommandPanel />
      </div>
    )}
  </div>
  );
}
