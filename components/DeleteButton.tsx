"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteComment } from "@/action/deleteComment";
import { deletePost } from "@/action/deletePost";
import { deleteCommunity } from "@/action/deleteCommunity";
import { useUser } from "@clerk/nextjs";

interface DeleteButtonProps {
  onDelete?: () => Promise<void>;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  // Legacy props for backward compatibility
  contentId?: string;
  contentType?: string;
  contentOwnerId?: string;
}

export default function DeleteButton({
  onDelete,
  title = "Delete Item",
  description = "This action cannot be undone",
  variant = "destructive",
  size = "default",
  className = "",
  children,
  disabled = false,
  // Legacy props
  contentId,
  contentType,
  contentOwnerId
}: DeleteButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser();

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    
    try {
      if (onDelete) {
        // New interface
        await onDelete();
      } else if (contentId && contentType && contentOwnerId) {
        // Legacy interface
        if (!isSignedIn) {
          throw new Error("You must be signed in to delete content");
        }
        
        if (contentOwnerId !== user?.id) {
          throw new Error("You can only delete your own content");
        }

        const response =
          contentType === "post"
            ? await deletePost(contentId)
            : contentType === "comment"
            ? await deleteComment(contentId)
            : contentType === "community"
            ? await deleteCommunity(contentId)
            : { error: "Unknown content type" };

        if (response.error) {
          throw new Error(response.error);
        }
      } else {
        throw new Error("Invalid delete configuration");
      }
      
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Failed to delete item. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // For legacy interface, check if user is owner
  if (contentOwnerId && contentOwnerId !== user?.id) {
    return null;
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="flex-1"
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Button */}
      <Button
        onClick={() => setShowModal(true)}
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || !isSignedIn}
      >
        {children || (
          <>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : isSignedIn ? "Delete" : "Sign in to delete"}
          </>
        )}
      </Button>
    </>
  );
}
