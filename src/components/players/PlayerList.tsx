'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { getStoredToken, listPlayers, getPlayerDetails, type PlayerDetails as IPlayerDetails } from '@/lib/api';
import PlayerDetails from './PlayerDetails';

const fetcher = async () => {
  const token = getStoredToken();
  if (!token) throw new Error('Not authenticated');
  return listPlayers(token);
};

export default function PlayerList() {
  const [selectedPlayer, setSelectedPlayer] = useState<IPlayerDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { data, error, isLoading } = useSWR('players', fetcher, {
    refreshInterval: 5000 // Refresh every 5 seconds
  });

  const handlePlayerClick = async (playerId: string) => {
    setIsLoadingDetails(true);
    try {
      const token = getStoredToken();
      if (!token) throw new Error('Not authenticated');
      
      const details = await getPlayerDetails(token, playerId);
      setSelectedPlayer(details);
    } catch (error) {
      console.error('Failed to load player details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load players
      </div>
    );
  }

  if (!data?.players?.length) {
    return (
      <div className="text-gray-500 text-center py-4">
        No players online
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {data.players.map((player) => (
          <div
            key={player.id}
            onClick={() => handlePlayerClick(player.id)}
            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-medium">{player.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Player Details Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <PlayerDetails
              player={selectedPlayer}
              onClose={() => setSelectedPlayer(null)}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
    </>
  );
}
