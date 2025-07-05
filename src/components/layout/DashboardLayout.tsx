'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredToken, clearStoredToken } from '@/lib/api';
import ServerHealth from '@/components/server/ServerHealth';
import PlayerList from '@/components/players/PlayerList';
import LogViewer from '@/components/logs/LogViewer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLogExpanded, setIsLogExpanded] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    clearStoredToken();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 text-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">Gatekeeper Dashboard</h1>
              <ServerHealth />
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Logs Section */}
            <div className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Server Logs</h2>
              <LogViewer onExpandChange={setIsLogExpanded} />
            </div>

            {/* Command Section */}
            {!isLogExpanded && (
              <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-lg font-medium mb-4">Execute Command</h2>
                {children}
              </div>
            )}
          </div>

          {/* Players List Section */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4">Online Players</h2>
              <PlayerList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
