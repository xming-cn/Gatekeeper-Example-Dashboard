'use client';

import { useState } from 'react';
import { PlayerDetails as IPlayerDetails, kickPlayer, sendPrivateMessage, getStoredToken } from '@/lib/api';

interface PlayerDetailsProps {
  player: IPlayerDetails;
  onClose: () => void;
}

export default function PlayerDetails({ player, onClose }: PlayerDetailsProps) {
  const [message, setMessage] = useState('');
  const [kickReason, setKickReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const token = getStoredToken();
    
    try {
      if (!token) throw new Error('Not authenticated');
      await sendPrivateMessage(token, player.id, message);
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kickReason.trim()) return;

    setIsLoading(true);
    const token = getStoredToken();
    
    try {
      if (!token) throw new Error('Not authenticated');
      await kickPlayer(token, player.id, kickReason);
      onClose();
    } catch (error) {
      console.error('Failed to kick player:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Player Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{player.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Health</p>
            <p className="font-medium">{player.health}/20</p>
          </div>
          <div>
            <p className="text-gray-500">Level</p>
            <p className="font-medium">{player.level}</p>
          </div>
          <div>
            <p className="text-gray-500">Game Mode</p>
            <p className="font-medium">{player.gameMode}</p>
          </div>
          <div>
            <p className="text-gray-500">Operator</p>
            <p className="font-medium">{player.isOp ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-gray-500">Ping</p>
            <p className="font-medium">{player.ping}ms</p>
          </div>
        </div>

        <div>
          <p className="text-gray-500 text-sm mb-1">Location</p>
          <p className="text-sm">
            {player.location.world} ({Math.round(player.location.x)}, {Math.round(player.location.y)}, {Math.round(player.location.z)})
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <form onSubmit={handleSendMessage} className="space-y-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send private message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Send Message
            </button>
          </form>

          <form onSubmit={handleKick} className="space-y-2">
            <input
              type="text"
              value={kickReason}
              onChange={(e) => setKickReason(e.target.value)}
              placeholder="Kick reason..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !kickReason.trim()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Kick Player
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
