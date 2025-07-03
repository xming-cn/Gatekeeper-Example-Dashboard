'use client';

import { useEffect, useState } from 'react';
import { getServerHealth, getStoredToken, formatUptime } from '@/lib/api';
import { ClockIcon } from '@heroicons/react/24/outline';

export default function ServerHealth() {
  const [uptime, setUptime] = useState<string>('Loading...');
  const [, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const token = getStoredToken();
        if (!token) return;
        
        const health = await getServerHealth(token);
        setUptime(formatUptime(health.uptime));
        setError(false);
      } catch {
        setError(true);
        setUptime('Error');
      }
    };

    // Fetch immediately
    fetchHealth();

    // Then fetch every 60 seconds
    const interval = setInterval(fetchHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-white/90">
      <ClockIcon className="h-5 w-5" />
      <span className="text-sm font-medium">
        Server Uptime: {uptime}
      </span>
    </div>
  );
}
