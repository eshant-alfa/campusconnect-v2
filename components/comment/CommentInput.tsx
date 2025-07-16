"use client";

import { useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { createComment } from "@/action/createComment";
import { usePathname } from "next/navigation";
import { AlertTriangle, CheckCircle } from "lucide-react";

function CommentInput({
  postId,
  parentCommentId,
}: {
  postId: string;
  parentCommentId?: string;
}) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [warning, setWarning] = useState<string | null>(null);
  const [isContentSafe, setIsContentSafe] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { user, isSignedIn } = useUser();

  // Real-time content checking
  useEffect(() => {
    if (!content.trim()) {
      setWarning(null);
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
          setWarning(result.reason);
          setIsContentSafe(false);
        } else {
          setWarning(null);
          setIsContentSafe(true);
        }
      } catch (error) {
        console.error('Content check error:', error);
        setWarning(null);
        setIsContentSafe(null);
      } finally {
        setIsChecking(false);
      }
    };

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(checkContent, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Prevent submission if content is flagged
    if (warning || isContentSafe === false) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await createComment(postId, content, parentCommentId);
        
        // If we get here, the comment was created successfully
        setContent("");
        setWarning(null);
        setIsContentSafe(null);
      } catch (error) {
        console.error("Failed to add comment:", error);
        setWarning(error instanceof Error ? error.message : "Failed to add comment. Please try again.");
      }
    });
  };

  const isSubmitDisabled = isPending || !isSignedIn || content.length === 0 || isContentSafe === false || isChecking;

  return (
    <div className="mt-2">
      {warning && (
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
                {warning}
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
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            type="text"
            placeholder={
              !isSignedIn ? "Sign in to comment" : "Add a comment..."
            }
            disabled={isPending || !isSignedIn}
            className={warning ? "border-red-300 focus:border-red-500" : ""}
          />
          {isChecking && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={isSubmitDisabled}
        >
          {isPending ? "Commenting..." : "Comment"}
        </Button>
      </form>
    </div>
  );
}

export default CommentInput;
