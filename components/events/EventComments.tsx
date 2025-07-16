'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface EventCommentsProps {
  eventId: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

function CommentItem({ comment, onReply }: { comment: any; onReply: (id: string) => void }) {
  return (
    <div className="border-b py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm">{comment.user?.username || comment.user?.clerkId || 'User'}</span>
        <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
      </div>
      <div className="text-gray-800 mb-1 whitespace-pre-line">{comment.content}</div>
      <div className="flex gap-2">
        <button onClick={() => onReply(comment._id)} className="text-xs text-blue-600 hover:underline">Reply</button>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 mt-2 border-l pl-2">
          {comment.replies.map((reply: any) => (
            <CommentItem key={reply._id} comment={reply} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildCommentTree(comments: any[]) {
  const map: Record<string, any> = {};
  const roots: any[] = [];
  comments.forEach(c => (map[c._id] = { ...c, replies: [] }));
  comments.forEach(c => {
    if (c.parentComment?._id && map[c.parentComment._id]) {
      map[c.parentComment._id].replies.push(map[c._id]);
    } else {
      roots.push(map[c._id]);
    }
  });
  return roots;
}

export default function EventComments({ eventId }: EventCommentsProps) {
  const { user, isSignedIn } = useUser();
  const { data, error, isLoading, mutate } = useSWR(`/api/events/${eventId}/comments`, fetcher);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [isContentSafe, setIsContentSafe] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Real-time content checking
  useEffect(() => {
    if (!content.trim()) {
      setErrMsg('');
      setIsContentSafe(null);
      return;
    }

    const checkContent = async () => {
      setIsChecking(true);
      try {
        const response = await fetch('/api/moderate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim(), type: 'comment' })
        });
        
        const result = await response.json();
        
        if (result.flagged) {
          setErrMsg(result.reason);
          setIsContentSafe(false);
        } else {
          setErrMsg('');
          setIsContentSafe(true);
        }
      } catch (error) {
        console.error('Content check error:', error);
        setErrMsg('');
        setIsContentSafe(null);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(checkContent, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Prevent submission if content is flagged
    if (errMsg || isContentSafe === false) {
      return;
    }

    setErrMsg('');
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentComment: replyTo }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to add comment');
      }
      setContent('');
      setReplyTo(null);
      setErrMsg('');
      setIsContentSafe(null);
      mutate();
    } catch (err: any) {
      setErrMsg(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReply(id: string) {
    setReplyTo(id);
  }

  const commentTree = data?.comments ? buildCommentTree(data.comments) : [];
  const isSubmitDisabled = loading || !content.trim() || isContentSafe === false || isChecking;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-bold mb-2">Comments</h2>
      {isSignedIn && (
        <form onSubmit={handleSubmit} className="mb-4">
          {replyTo && (
            <div className="mb-1 text-xs text-gray-600">Replying to a comment <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-blue-600 hover:underline">Cancel</button></div>
          )}
          <div className="relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={3}
              placeholder="Write a comment..."
              className={`w-full border rounded px-3 py-2 mb-2 ${errMsg ? "border-red-300 focus:border-red-500" : ""}`}
            />
            {isChecking && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              </div>
            )}
          </div>
          {errMsg && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-in slide-in-from-top-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Content Warning
                  </h4>
                  <p className="text-sm text-red-700 mb-2">
                    {errMsg}
                  </p>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      Please review your comment and remove any inappropriate language before posting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isContentSafe === true && content.trim() && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Content looks good!</span>
              </div>
            </div>
          )}
          <button type="submit" disabled={isSubmitDisabled} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
          </button>
        </form>
      )}
      {isLoading && <div>Loading comments...</div>}
      {error && <div className="text-red-500">Failed to load comments.</div>}
      {commentTree.length === 0 && <div className="text-gray-500">No comments yet.</div>}
      {commentTree.map((comment: any) => (
        <CommentItem key={comment._id} comment={comment} onReply={handleReply} />
      ))}
    </div>
  );
} 