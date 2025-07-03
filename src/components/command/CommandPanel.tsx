'use client';

import { useState } from 'react';
import { executeCommand, getStoredToken } from '@/lib/api';

interface CommandHistory {
  command: string;
  response: string;
  success: boolean;
  timestamp: Date;
}

export default function CommandPanel() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);
    const token = getStoredToken();
    
    try {
      if (!token) throw new Error('Not authenticated');
      
      const result = await executeCommand(token, command);
    const historyRef = document.querySelector('.command-history');
    setHistory(prev => [{
      command,
      response: result.message,
      success: result.success,
      timestamp: new Date()
    }, ...prev]);
    // Scroll the command history container to top after adding new command
    if (historyRef) {
      historyRef.scrollTop = 0;
    }
      
      setCommand('');
    } catch (error) {
      setHistory(prev => [{
        command,
        response: 'Failed to execute command',
        success: false,
        timestamp: new Date()
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter Minecraft command..."
            className="flex-1 px-3 py-2 rounded border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
          />
          <button
            type="submit"
            disabled={isLoading || !command.trim()}
            className={`px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              (isLoading || !command.trim()) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Execute
          </button>
        </div>
      </form>

      {/* Command History */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Command History</h3>
        <div className="command-history space-y-2 h-48 min-h-[12rem] max-h-48 overflow-y-auto scrollbar-thin">
          {history.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded ${
                item.success ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div className="flex justify-between text-sm text-gray-500">
                <span className="font-mono">/{item.command}</span>
                <span>{item.timestamp.toLocaleTimeString()}</span>
              </div>
              <div
                className={`mt-1 ${
                  item.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {item.response}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
