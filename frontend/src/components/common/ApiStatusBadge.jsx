import React, { useEffect, useState } from 'react';
import { checkHealth } from '../../services/api';
import { Activity, Database, Server } from 'lucide-react';

export default function ApiStatusBadge() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyBackend = async () => {
      const data = await checkHealth();
      if (isMounted) {
        setHealth(data);
        setLoading(false);
      }
    };

    verifyBackend();
    const interval = setInterval(verifyBackend, 15000); // Check every 15s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isServerUp = health?.success;
  const dbStatus = health?.database?.status || 'Unknown';
  const isDbConnected = dbStatus === 'Connected';

  return (
    <div className="flex items-center gap-2 bg-slate-900/5 backdrop-blur-sm border border-slate-200/80 rounded-full px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 rounded-full ${
            loading
              ? 'bg-amber-400 animate-ping'
              : isServerUp
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          }`}
        />
        <span className="flex items-center gap-1">
          <Server className="w-3 h-3 text-slate-500" />
          {loading ? 'Checking...' : isServerUp ? 'API Online' : 'API Offline'}
        </span>
      </div>

      <span className="text-slate-300">|</span>

      <div className="flex items-center gap-1">
        <Database className="w-3 h-3 text-slate-500" />
        <span
          className={
            isDbConnected
              ? 'text-emerald-700 font-semibold'
              : 'text-amber-700 font-medium'
          }
        >
          DB: {dbStatus}
        </span>
      </div>
    </div>
  );
}

