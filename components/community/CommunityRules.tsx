'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { ShieldCheck, Plus, Edit2, Trash2, Info } from 'lucide-react';

interface Rule {
  title: string;
  description: string;
}

interface CommunityRulesProps {
  slug: string;
  userRole: 'owner' | 'moderator' | 'member' | 'guest';
}

export const CommunityRules: React.FC<CommunityRulesProps> = ({ slug, userRole }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/community/${slug}/rules`)
      .then(res => res.json())
      .then(data => {
        setRules(data.rules || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load rules.');
        setLoading(false);
      });
  }, [slug]);

  const canEdit = userRole === 'owner' || userRole === 'moderator';

  const handleAddRule = () => {
    setShowAddModal(true);
    setAddError(null);
    setNewTitle('');
    setNewDescription('');
  };

  const handleAddRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const res = await fetch(`/api/community/${slug}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || 'Failed to add rule.');
      } else {
        setRules(data.rules || []);
        setShowAddModal(false);
      }
    } catch {
      setAddError('Failed to add rule.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditRule = (index: number) => {
    setEditIndex(index);
    setEditTitle(rules[index].title);
    setEditDescription(rules[index].description);
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex === null) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/community/${slug}/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleIndex: editIndex, title: editTitle, description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Failed to update rule.');
      } else {
        setRules(data.rules || []);
        setShowEditModal(false);
      }
    } catch {
      setEditError('Failed to update rule.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteRule = (index: number) => {
    setDeleteIndex(index);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  const handleDeleteRuleConfirm = async () => {
    if (deleteIndex === null) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/community/${slug}/rules`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleIndex: deleteIndex }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error || 'Failed to delete rule.');
      } else {
        setRules(data.rules || []);
        setShowDeleteModal(false);
      }
    } catch {
      setDeleteError('Failed to delete rule.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <section className="max-w-2xl mx-auto my-8 p-0 bg-white rounded-2xl shadow-lg border border-blue-100 h-full flex flex-col">
      <header className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-blue-50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-blue-900">Community Rules</h2>
          <Info className="w-4 h-4 text-blue-400 ml-1" />
        </div>
        {canEdit && (
          <Button onClick={handleAddRule} variant="default" size="sm" className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            <Plus className="w-4 h-4" /> Add Rule
          </Button>
        )}
      </header>
      <div className="px-6 pb-6 pt-2">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-2/3" />
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-blue-500">
          <ShieldCheck className="w-10 h-10 mb-2" />
          <span className="font-medium">No rules have been set for this community yet.</span>
          {canEdit && <span className="text-sm text-blue-400">Click "Add Rule" to create your first rule.</span>}
        </div>
      ) : (
        <ul className="space-y-4">
          {rules.map((rule, idx) => (
            <li key={idx}>
              <div className="p-4 flex flex-col gap-2 relative border rounded-xl bg-blue-50/60 border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-base text-blue-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-400" /> {rule.title}
                  </span>
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleEditRule(idx)} size="sm" variant="outline" className="flex items-center gap-1"><Edit2 className="w-4 h-4" /> Edit</Button>
                      <Button onClick={() => handleDeleteRule(idx)} size="sm" variant="destructive" className="flex items-center gap-1"><Trash2 className="w-4 h-4" /> Delete</Button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 text-sm">{rule.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
      {/* Add Rule Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Community Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRuleSubmit} className="space-y-4">
            <div>
              <label htmlFor="rule-title" className="block text-sm font-medium mb-1">Title</label>
              <Input
                id="rule-title"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter rule title"
                disabled={addLoading}
              />
            </div>
            <div>
              <label htmlFor="rule-description" className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                id="rule-description"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                required
                maxLength={500}
                placeholder="Enter rule description"
                disabled={addLoading}
              />
            </div>
            {addError && <div className="text-red-600 text-sm">{addError}</div>}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Rule'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={addLoading}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Rule Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Community Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditRuleSubmit} className="space-y-4">
            <div>
              <label htmlFor="edit-rule-title" className="block text-sm font-medium mb-1">Title</label>
              <Input
                id="edit-rule-title"
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter rule title"
                disabled={editLoading}
              />
            </div>
            <div>
              <label htmlFor="edit-rule-description" className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                id="edit-rule-description"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                required
                maxLength={500}
                placeholder="Enter rule description"
                disabled={editLoading}
              />
            </div>
            {editError && <div className="text-red-600 text-sm">{editError}</div>}
            <DialogFooter>
              <Button type="submit" variant="default" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={editLoading}>Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Rule Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Community Rule</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this rule?</p>
            {deleteError && <div className="text-red-600 text-sm mt-2">{deleteError}</div>}
          </div>
          <DialogFooter>
            <Button onClick={handleDeleteRuleConfirm} variant="destructive" disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleteLoading}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CommunityRules; 