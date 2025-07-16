'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

interface ModLog {
  _id: string;
  actionType: string;
  mod?: { username?: string };
  targetUser?: { username?: string };
  targetPost?: { _id?: string };
  reason?: string;
  createdAt?: string;
}

interface ModerationLogsProps {
  slug: string;
  userRole: 'owner' | 'moderator' | 'member' | 'guest';
}

export const ModerationLogs: React.FC<ModerationLogsProps> = ({ slug, userRole }) => {
  const [logs, setLogs] = useState<ModLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userRole !== 'owner' && userRole !== 'moderator') return;
    setLoading(true);
    setError(null);
    fetch(`/api/community/${slug}/modlogs`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.modLogs || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load moderation logs.');
        setLoading(false);
      });
  }, [slug, userRole]);

  if (userRole !== 'owner' && userRole !== 'moderator') {
    return null;
  }

  return (
    <section className="max-w-3xl mx-auto my-8 p-4 bg-white rounded-lg shadow">
      <header className="mb-4">
        <h2 className="text-xl font-bold">Moderation Logs</h2>
      </header>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500">No moderation actions have been logged yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border rounded-lg bg-gray-50">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left font-semibold">Action</th>
                <th className="px-4 py-2 text-left font-semibold">Moderator</th>
                <th className="px-4 py-2 text-left font-semibold">Target User</th>
                <th className="px-4 py-2 text-left font-semibold">Reason</th>
                <th className="px-4 py-2 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t">
                  <td className="px-4 py-2 capitalize">{log.actionType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-2">{log.mod?.username || '—'}</td>
                  <td className="px-4 py-2">{log.targetUser?.username || '—'}</td>
                  <td className="px-4 py-2">{log.reason || '—'}</td>
                  <td className="px-4 py-2">{log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default ModerationLogs; 