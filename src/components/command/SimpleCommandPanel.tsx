'use client';

import { useState } from 'react';
import { executeCommand, getStoredToken } from '@/lib/api';

export default function SimpleCommandPanel() {
  const [command, setCommand] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsLoading(true);
    const token = getStoredToken();
    
    try {
      if (!token) throw new Error('Not authenticated');
      await executeCommand(token, command);
      setCommand('');
    } catch {
      // Error is already handled by websocket logs
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
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
    </form>
  );
}
