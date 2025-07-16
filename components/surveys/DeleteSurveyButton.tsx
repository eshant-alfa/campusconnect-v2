"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteSurveyButtonProps {
  surveyId: string;
  surveyTitle: string;
  onDelete?: () => void;
}

export default function DeleteSurveyButton({ 
  surveyId, 
  surveyTitle, 
  onDelete 
}: DeleteSurveyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log(`Attempting to delete survey: ${surveyId}`);
      
      const response = await fetch(`/api/surveys/${surveyId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete survey');
      }

      toast({
        title: "Survey deleted",
        description: "The survey has been permanently deleted.",
      });

      setIsOpen(false);
      
      // Call the onDelete callback to refresh the list
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete survey",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Survey</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{surveyTitle}"? This action cannot be undone and will permanently remove the survey and all its responses.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 