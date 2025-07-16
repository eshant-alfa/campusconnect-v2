'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { MessageCircle, Info, Edit2, Plus } from 'lucide-react';

interface WelcomeMessageProps {
  slug: string;
  userRole: 'owner' | 'moderator' | 'member' | 'guest';
}

export const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ slug, userRole }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/community/${slug}/welcome-message`)
      .then(res => res.json())
      .then(data => {
        setMessage(data.welcomeMessage || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load welcome message.');
        setLoading(false);
      });
  }, [slug]);

  const canEdit = userRole === 'owner' || userRole === 'moderator';

  const handleEdit = () => {
    setEditValue(message);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/community/${slug}/welcome-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ welcomeMessage: editValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update welcome message.');
      } else {
        setMessage(data.welcomeMessage || '');
        setShowEditModal(false);
      }
    } catch {
      setEditError('Failed to update welcome message.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto my-8 p-0 bg-white rounded-2xl shadow-lg border border-blue-100">
      <header className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-blue-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">Welcome Message</h2>
          <Info className="w-4 h-4 text-blue-400 ml-1" />
        </div>
        {canEdit && (
          <Button onClick={handleEdit} variant="default" size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            {message ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {message ? 'Edit' : 'Add'}
          </Button>
        )}
      </header>
      <div className="px-6 pb-6 pt-2">
      {loading ? (
        <Skeleton className="h-6 w-3/4" />
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !message ? (
        <div className="flex flex-col items-center gap-2 py-8 text-blue-500">
          <MessageCircle className="w-10 h-10 mb-2" />
          <span className="font-medium">No welcome message set for this community yet.</span>
          {canEdit && <span className="text-sm text-blue-400">Click "Add" to create a welcome message.</span>}
        </div>
      ) : (
        <div className="text-base text-gray-800 whitespace-pre-line bg-blue-50/60 border border-blue-100 rounded-lg p-4 shadow-sm">{message}</div>
      )}
      </div>
      {/* Edit Welcome Message Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{message ? 'Edit' : 'Add'} Welcome Message</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="welcome-message" className="block text-sm font-medium mb-1">Message</label>
              <Textarea
                id="welcome-message"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                required
                maxLength={1000}
                placeholder="Enter a welcome message for new members..."
                disabled={editLoading}
              />
            </div>
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={editLoading}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default WelcomeMessage; 