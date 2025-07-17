"use client";

import { useState, useTransition } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createPost } from "@/action/createPost";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { AlertTriangle, CheckCircle, Upload, X } from "lucide-react";
import { SubredditCombobox } from "../subreddit/SubredditCombobox";
import { GetSubredditsQueryResult } from "@/sanity.types";

interface CreatePostFormProps {
  subreddit: string; // Make this required
  subreddits?: GetSubredditsQueryResult;
}

function CreatePostForm({ subreddit, subreddits = [] }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // Remove local subreddit state - use the prop directly
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [isContentSafe, setIsContentSafe] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  // Real-time content checking
  const checkContent = async (content: string, type: 'post') => {
    if (!content.trim()) {
      setWarningMessage("");
      setIsContentSafe(null);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/moderate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), type })
      });
      
      const result = await response.json();
      
      if (result.flagged) {
        setWarningMessage(result.reason);
        setIsContentSafe(false);
      } else {
        setWarningMessage("");
        setIsContentSafe(true);
      }
    } catch (error) {
      console.error('Content check error:', error);
      setWarningMessage("");
      setIsContentSafe(null);
    } finally {
      setIsChecking(false);
    }
  };

  // Check title and body content
  const checkPostContent = () => {
    const combinedContent = `${title} ${body}`.trim();
    if (combinedContent) {
      checkContent(combinedContent, 'post');
    }
  };

  // Debounced content checking
  const debouncedCheck = (() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkPostContent, 500);
    };
  })();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    debouncedCheck();
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    debouncedCheck();
  };

  const resetForm = () => {
    setTitle("");
    setBody("");
    // Remove setSubreddit("") - we don't manage subreddit state locally
    setImageFile(null);
    setImagePreview(null);
    setErrorMessage("");
    setWarningMessage("");
    setIsContentSafe(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Upload image to Sanity (like Events do)
  const uploadImageToSanity = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    const res = await fetch('/api/sanity/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.image;
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Post title is required");
      return;
    }

    // Prevent submission if content is flagged
    if (warningMessage || isContentSafe === false) {
      return;
    }

    setErrorMessage("");
    setWarningMessage("");
    setIsLoading(true);

    try {
      let imageField = null;
      if (imageFile) {
        imageField = await uploadImageToSanity(imageFile);
      }

      const result = await createPost({
        title: title.trim(),
        subredditSlug: subreddit,
        body: body.trim() || undefined,
        imageField: imageField, // Pass the Sanity image object
      });

      resetForm();
      console.log("Finished creating post", result);

      if ("error" in result && result.error) {
        // Check if it's a moderation-related error
        if (typeof result.error === 'string' && (result.error.includes("blocked") || result.error.includes("inappropriate"))) {
          setWarningMessage(result.error);
        } else {
          setErrorMessage(typeof result.error === 'string' ? result.error : 'An error occurred');
        }
      } else {
        router.push(`/community/${subreddit}`);
      }
    } catch (err) {
      console.error("Failed to create post", err);
      setErrorMessage("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isPending || !isSignedIn || !title.trim() || !subreddit || isContentSafe === false || isChecking;

  if (!isSignedIn) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a Post</CardTitle>
          <CardDescription>Sign in to create a new post</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Please sign in to create posts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create a New Post
          </CardTitle>
          <CardDescription>
            Share your thoughts, questions, or updates with the community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {warningMessage && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-in slide-in-from-top-2">
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
                    {warningMessage}
                  </p>
                  <div className="bg-white p-3 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      Please review your post and remove any inappropriate language before posting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isContentSafe === true && (title.trim() || body.trim()) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">Content looks good!</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleCreatePost} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="What's on your mind?"
                  className={warningMessage ? "border-red-300 focus:border-red-500" : ""}
                  maxLength={300}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  {isChecking && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  )}
                  <span className="text-xs text-gray-400">
                    {title.length}/300
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium">
                Content (Optional)
              </Label>
              <div className="relative">
                <Textarea
                  id="body"
                  value={body}
                  onChange={handleBodyChange}
                  placeholder="Add more details to your post..."
                  rows={6}
                  className={warningMessage ? "border-red-300 focus:border-red-500" : ""}
                  maxLength={10000}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {body.length}/10000
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-medium">
                Image (Optional)
              </Label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </Button>
                  {imageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeImage}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
            >
              {isLoading || isPending ? "Creating Post..." : "Create Post"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreatePostForm;
