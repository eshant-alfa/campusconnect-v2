'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface Appeal {
  _id: string;
  user?: { username?: string; _id?: string };
  targetType: string;
  targetId?: string;
  reason: string;
  status: string;
  createdAt?: string;
  reviewedBy?: { username?: string };
  reviewedAt?: string;
}

interface AppealsProps {
  slug: string;
  userId: string | null;
  userRole: 'owner' | 'moderator' | 'member' | 'guest';
}

export const Appeals: React.FC<AppealsProps> = ({ slug, userId, userRole }) => {
  if (userRole !== 'owner' && userRole !== 'moderator') {
    return null;
  }
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [targetType, setTargetType] = useState('ban');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewAppeal, setReviewAppeal] = useState<Appeal | null>(null);
  const [reviewStatus, setReviewStatus] = useState('approved');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/community/${slug}/appeals`)
      .then(res => res.json())
      .then(data => {
        setAppeals(data.appeals || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load appeals.');
        setLoading(false);
      });
  }, [slug]);

  const canReview = true; // Only owner/mod gets here
  const visibleAppeals = appeals;

  // Add Appeal
  const handleAddAppeal = () => {
    setShowAddModal(true);
    setAddError(null);
    setTargetType('ban');
    setTargetId('');
    setReason('');
  };
  const handleAddAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/community/${slug}/appeals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId, targetType, targetId, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to submit appeal.');
      } else {
        setAppeals(data.appeals || []);
        setShowAddModal(false);
      }
    } catch {
      setAddError('Failed to submit appeal.');
    } finally {
      setAddLoading(false);
    }
  };

  // Review Appeal
  const handleReviewAppeal = (appeal: Appeal) => {
    setReviewAppeal(appeal);
    setReviewStatus('approved');
    setReviewError(null);
    setShowReviewModal(true);
  };
  const handleReviewAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAppeal) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch(`/api/community/${slug}/appeals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appealId: reviewAppeal._id, status: reviewStatus, reviewedBy: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to update appeal.');
      } else {
        setAppeals(prev => prev.map(a => a._id === data.appeal._id ? data.appeal : a));
        setShowReviewModal(false);
      }
    } catch {
      setReviewError('Failed to update appeal.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto my-8 p-4 bg-white rounded-lg shadow">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Appeals</h2>
      </header>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : userRole === 'owner' || userRole === 'moderator' ? (
        visibleAppeals.length === 0 ? (
          <div className="text-gray-500">No appeals found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border rounded-lg bg-gray-50">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-left font-semibold">Reason</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Submitted</th>
                  <th className="px-4 py-2 text-left font-semibold">User</th>
                  <th className="px-4 py-2 text-left font-semibold">Reviewed By</th>
                  <th className="px-4 py-2 text-left font-semibold">Reviewed At</th>
                  {canReview && <th className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {visibleAppeals.map((appeal) => (
                  <tr key={appeal._id} className="border-t">
                    <td className="px-4 py-2 capitalize">{appeal.targetType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2">{appeal.reason}</td>
                    <td className="px-4 py-2 capitalize">{appeal.status}</td>
                    <td className="px-4 py-2">{appeal.createdAt ? new Date(appeal.createdAt).toLocaleString() : '—'}</td>
                    <td className="px-4 py-2">{appeal.user?.username || '—'}</td>
                    <td className="px-4 py-2">{appeal.reviewedBy?.username || '—'}</td>
                    <td className="px-4 py-2">{appeal.reviewedAt ? new Date(appeal.reviewedAt).toLocaleString() : '—'}</td>
                    {canReview && (
                      <td className="px-4 py-2">
                        {appeal.status === 'pending' && (
                          <Button size="sm" variant="outline" onClick={() => handleReviewAppeal(appeal)}>
                            Review
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // For regular users, show only their own appeals or a message
        visibleAppeals.length === 0 ? (
          <div className="text-gray-500">No appeals found.</div>
        ) : (
          <ul className="space-y-2">
            {visibleAppeals.map((appeal) => (
              <li key={appeal._id} className="border rounded p-3 bg-gray-50">
                <div className="font-semibold">Type: <span className="capitalize">{appeal.targetType.replace(/_/g, ' ')}</span></div>
                <div>Status: <span className="capitalize">{appeal.status}</span></div>
                <div>Reason: {appeal.reason}</div>
                <div>Submitted: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleString() : '—'}</div>
                {appeal.reviewedBy?.username && <div>Reviewed By: {appeal.reviewedBy.username}</div>}
                {appeal.reviewedAt && <div>Reviewed At: {new Date(appeal.reviewedAt).toLocaleString()}</div>}
              </li>
            ))}
          </ul>
        )
      )}
      {/* Add Appeal Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Appeal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAppealSubmit} className="space-y-4">
            <div>
              <label htmlFor="appeal-type" className="block text-sm font-medium mb-1">Type</label>
              <select
                id="appeal-type"
                className="w-full border rounded-md px-3 py-2"
                value={targetType}
                onChange={e => setTargetType(e.target.value)}
                disabled={addLoading}
                required
              >
                <option value="ban">Ban</option>
                <option value="post_removal">Post Removal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="appeal-target-id" className="block text-sm font-medium mb-1">Target ID (optional)</label>
              <Input
                id="appeal-target-id"
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                placeholder="ID of ban, post, etc. (if applicable)"
                disabled={addLoading}
              />
            </div>
            <div>
              <label htmlFor="appeal-reason" className="block text-sm font-medium mb-1">Reason</label>
              <Textarea
                id="appeal-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
                maxLength={500}
                placeholder="Explain why you are appealing..."
                disabled={addLoading}
              />
            </div>
            {addError && <div className="text-red-600 text-sm">{addError}</div>}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={addLoading}>
                {addLoading ? 'Submitting...' : 'Submit Appeal'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={addLoading}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Review Appeal Modal (mods/admins) */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReviewAppealSubmit} className="space-y-4">
            <div>
              <label htmlFor="review-status" className="block text-sm font-medium mb-1">Status</label>
              <select
                id="review-status"
                className="w-full border rounded-md px-3 py-2"
                value={reviewStatus}
                onChange={e => setReviewStatus(e.target.value)}
                disabled={reviewLoading}
                required
              >
                <option value="approved">Approve</option>
                <option value="rejected">Reject</option>
              </select>
            </div>
            {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={reviewLoading}>
                {reviewLoading ? 'Saving...' : 'Save Decision'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={reviewLoading}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Appeals; 