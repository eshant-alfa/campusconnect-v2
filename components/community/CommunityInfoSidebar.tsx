'use client';

import React, { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ShieldCheck, Users, Link as LinkIcon, Crown, UserCheck, ChevronDown, ChevronRight, Edit2, UserPlus, UserX, Loader2, BarChart2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import useSWR from 'swr';
import PendingApprovals from './PendingApprovals';

interface CommunityInfoSidebarProps {
  community: any;
  userRole: 'owner' | 'moderator' | 'member' | 'guest';
  isMember: boolean;
  isPending: boolean;
  memberCount: number;
  slug: string;
}

export const CommunityInfoSidebar: React.FC<CommunityInfoSidebarProps> = ({
  community,
  userRole,
  isMember,
  isPending,
  memberCount,
  slug
}) => {
  const [openRules, setOpenRules] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcomeEdit, setShowWelcomeEdit] = useState(false);
  const [welcomeEditValue, setWelcomeEditValue] = useState('');
  const [welcomeEditLoading, setWelcomeEditLoading] = useState(false);
  const [welcomeEditError, setWelcomeEditError] = useState<string | null>(null);
  // Modal state for add/edit rule
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleMode, setRuleMode] = useState<'add' | 'edit'>('add');
  const [ruleIndex, setRuleIndex] = useState<number | null>(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDescription, setRuleDescription] = useState('');
  const [ruleLoading, setRuleLoading] = useState(false);
  const [ruleError, setRuleError] = useState<string | null>(null);

  useEffect(() => {
    setWelcomeMessage(community.welcomeMessage || '');
  }, [community.welcomeMessage]);

  const getMembershipStatus = () => {
    if (userRole === 'owner') return { text: 'Owner', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
    if (userRole === 'moderator') return { text: 'Moderator', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (isMember) return { text: 'Member', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (isPending) return { text: 'Pending Approval', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { text: 'Not a Member', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
  };

  const membershipStatus = getMembershipStatus();

  const toggleRule = (ruleIndex: number) => {
    const ruleId = `rule-${ruleIndex}`;
    setOpenRules(prev =>
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  // Open modal for add
  const handleAddRule = () => {
    setRuleMode('add');
    setRuleIndex(null);
    setRuleTitle('');
    setRuleDescription('');
    setRuleError(null);
    setShowRuleModal(true);
  };
  // Open modal for edit
  const handleEditRule = (index: number) => {
    setRuleMode('edit');
    setRuleIndex(index);
    setRuleTitle(community.rules[index].title);
    setRuleDescription(community.rules[index].description);
    setRuleError(null);
    setShowRuleModal(true);
  };
  // Submit handler for add/edit
  const handleRuleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleLoading(true);
    setRuleError(null);
    try {
      let res, data;
      if (ruleMode === 'add') {
        res = await fetch(`/api/community/${slug}/rules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: ruleTitle, description: ruleDescription }),
        });
      } else {
        res = await fetch(`/api/community/${slug}/rules`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ruleIndex, title: ruleTitle, description: ruleDescription }),
        });
      }
      data = await res.json();
      if (!res.ok) {
        setRuleError(data.error || 'Failed to save rule.');
      } else {
        setShowRuleModal(false);
        window.location.reload();
      }
    } catch (err) {
      setRuleError('Failed to save rule.');
    } finally {
      setRuleLoading(false);
    }
  };

  const handleWelcomeEdit = () => {
    setWelcomeEditValue(welcomeMessage);
    setWelcomeEditError(null);
    setShowWelcomeEdit(true);
  };

  const handleWelcomeEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWelcomeEditLoading(true);
    setWelcomeEditError(null);
    try {
      console.log('Updating welcome message for slug:', slug);
      console.log('New message:', welcomeEditValue);
      
      const res = await fetch(`/api/community/${slug}/welcome-message`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: welcomeEditValue }),
      });
      
      console.log('Welcome message update response status:', res.status);
      const data = await res.json();
      console.log('Welcome message update response data:', data);
      
      if (!res.ok) {
        console.error('Welcome message update failed:', data);
        setWelcomeEditError(data.error || 'Failed to update welcome message.');
      } else {
        console.log('Welcome message updated successfully');
        setShowWelcomeEdit(false);
        window.location.reload();
      }
    } catch (err) {
      console.error('Welcome message update error:', err);
      setWelcomeEditError('Failed to update welcome message.');
    } finally {
      setWelcomeEditLoading(false);
    }
  };

  const fetcher = (url: string) => fetch(url).then(res => res.json());
  const { data: swrCommunity } = useSWR(`/api/community/${slug}/data`, fetcher, { fallbackData: community });
  const communityData = swrCommunity || community;

  // Calculate active member count
  const activeMemberCount = Array.isArray(communityData.members)
    ? communityData.members.filter((m: any) => m.status === 'active').length
    : 0;

  // Support multiple moderators if schema allows
  const moderators = Array.isArray(communityData.moderators)
    ? communityData.moderators
    : communityData.moderator
    ? [communityData.moderator]
    : [];

  return (
    <aside className="w-full bg-white rounded-2xl shadow-lg border border-blue-100 p-0 flex flex-col gap-6">
      {/* Welcome Message - styled like a rule */}
      <div className="px-6 pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-900">Welcome Message</h3>
            </div>
            {userRole === 'owner' || userRole === 'moderator' ? (
              <Button size="sm" variant="ghost" onClick={handleWelcomeEdit}>
                <Edit2 className="w-4 h-4 mr-1" /> Edit
              </Button>
            ) : null}
          </div>
          <div className="text-gray-700 whitespace-pre-line min-h-[40px]">
            {welcomeMessage || <span className="text-gray-400">No welcome message set for this community yet.</span>}
          </div>
        </div>
        {/* Edit Welcome Message Modal */}
        <Dialog open={showWelcomeEdit} onOpenChange={setShowWelcomeEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Welcome Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleWelcomeEditSubmit} className="space-y-4">
              <div>
                <Textarea
                  id="edit-welcome-message"
                  value={welcomeEditValue}
                  onChange={e => setWelcomeEditValue(e.target.value)}
                  required
                  maxLength={500}
                  placeholder="Enter welcome message"
                  disabled={welcomeEditLoading}
                  rows={6}
                />
              </div>
              {welcomeEditError && <div className="text-red-600 text-sm">{welcomeEditError}</div>}
              <DialogFooter>
                <Button type="submit" variant="default" disabled={welcomeEditLoading}>
                  {welcomeEditLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={welcomeEditLoading}>Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Community Rules */}
      <div className="px-6">
        <div className="flex items-center gap-2 justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Community Rules</h3>
          </div>
          {(userRole === 'owner' || userRole === 'moderator') && (
            <Button
              size="icon"
              variant="ghost"
              className="ml-2"
              onClick={handleAddRule}
              aria-label="Add Rule"
            >
              <UserPlus className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {communityData.rules && communityData.rules.length > 0 ? (
            communityData.rules.map((rule: any, index: number) => (
              <div key={index} className="flex items-center justify-between border-b border-blue-100 last:border-b-0 py-2">
                <div className="flex flex-col">
                  <span className="font-medium text-blue-900 text-sm">{rule.title}</span>
                  <span className="text-xs text-gray-700 whitespace-pre-line">{rule.description}</span>
                </div>
                {(userRole === 'owner' || userRole === 'moderator') && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => handleEditRule(index)}
                    aria-label="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500 italic py-2">
              No rules have been set for this community yet.
            </div>
          )}
        </div>
        {/* Add/Edit Rule Modal (shared) */}
        <Dialog open={showRuleModal} onOpenChange={setShowRuleModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{ruleMode === 'add' ? 'Add Community Rule' : 'Edit Community Rule'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleRuleModalSubmit} className="space-y-4">
              <div>
                <label htmlFor="rule-title" className="block text-sm font-medium mb-1">Title</label>
                <Input
                  id="rule-title"
                  value={ruleTitle}
                  onChange={e => setRuleTitle(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Enter rule title"
                  disabled={ruleLoading}
                />
              </div>
              <div>
                <label htmlFor="rule-description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  id="rule-description"
                  value={ruleDescription}
                  onChange={e => setRuleDescription(e.target.value)}
                  required
                  maxLength={500}
                  placeholder="Enter rule description"
                  disabled={ruleLoading}
                />
              </div>
              {ruleError && <div className="text-red-600 text-sm">{ruleError}</div>}
              <DialogFooter>
                <Button type="submit" variant="default" disabled={ruleLoading}>
                  {ruleLoading ? (ruleMode === 'add' ? 'Adding...' : 'Saving...') : (ruleMode === 'add' ? 'Add Rule' : 'Save Changes')}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={ruleLoading}>Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Membership Status */}
      <div className="px-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Your Status</h3>
          </div>
          <div className={`p-3 rounded-lg border ${membershipStatus.bg} ${membershipStatus.border}`}>
            <div className={`text-sm font-semibold ${membershipStatus.color}`}>
              {membershipStatus.text}
            </div>
          </div>
        </div>
      </div>

      {/* Community Stats */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Community Stats</h3>
        </div>
        <div className="text-gray-700">Members: {activeMemberCount}</div>
      </div>

      {/* Pending Approvals (only for owner/mod) */}
      {(userRole === 'owner' || userRole === 'moderator') && (
        <PendingApprovals slug={slug} />
      )}
    </aside>
  );
}; 