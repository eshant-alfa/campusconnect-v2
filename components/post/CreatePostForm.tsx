"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/action/createPost";
import dynamic from 'next/dynamic';

const ReactSelect = dynamic(() => import('react-select'), { ssr: false });

function CreatePostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const subreddit = searchParams.get("subreddit");
  const [categories, setCategories] = useState<{_id: string, title: string}[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories from Sanity
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  if (!subreddit) {
    return (
      <div className="text-center p-4">
        <p>Please select a community first</p>
      </div>
    );
  }

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Post title is required");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      let imageBase64: string | null = null;
      let fileName: string | null = null;
      let fileType: string | null = null;

      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        fileName = imageFile.name;
        fileType = imageFile.type;
      }

      const result = await createPost({
        title: title.trim(),
        subredditSlug: subreddit,
        body: body.trim() || undefined,
        imageBase64: imageBase64,
        imageFilename: fileName,
        imageContentType: fileType,
      });

      resetForm();

      if ("error" in result && result.error) {
        setErrorMessage(result.error);
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

  const resetForm = () => {
    setTitle("");
    setBody("");
    setErrorMessage("");
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Map categories for React Select
  const categoryOptions = categories.map(cat => ({ value: cat._id, label: cat.title }));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form onSubmit={handleCreatePost} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h2 className="text-2xl font-bold mb-2">Create Post</h2>
        <p className="text-gray-500 mb-6">Share your thoughts, questions, or resources with your community.</p>

        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold">Title</label>
          <Input
            id="title"
            name="title"
            placeholder="Title of your post"
            className="w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={300}
          />
          {errorMessage && !title && <div className="text-red-500 text-xs">{errorMessage}</div>}
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label htmlFor="body" className="text-sm font-semibold">Body <span className="text-gray-400">(optional)</span></label>
          <Textarea
            id="body"
            name="body"
            placeholder="Text (optional)"
            className="w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Image <span className="text-gray-400">(optional)</span></label>
          <div className="relative w-full h-48 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Post preview"
                  fill
                  className="object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-red-600"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <span className="text-3xl text-gray-400 mb-2"><ImageIcon /></span>
                <span className="text-gray-500">Click to upload an image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <label htmlFor="categories" className="text-sm font-semibold">Categories</label>
          <ReactSelect
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter(opt => selectedCategories.includes(opt.value))}
            onChange={opts => setSelectedCategories(Array.isArray(opts) ? opts.map(opt => opt.value) : [])}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Select categories..."
            instanceId="categories-select"
            styles={{
              control: (base) => ({ ...base, borderRadius: '0.5rem', minHeight: 48, borderColor: '#d1d5db', boxShadow: 'none', '&:hover': { borderColor: '#6366f1' } }),
              multiValue: (base) => ({ ...base, backgroundColor: '#dbeafe', color: '#1e40af' }),
              multiValueLabel: (base) => ({ ...base, color: '#1e40af' }),
              multiValueRemove: (base) => ({ ...base, color: '#1e40af', ':hover': { backgroundColor: '#1e40af', color: 'white' } }),
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading && <span className="loader border-white border-t-blue-500 mr-2"></span>}
          Post
        </Button>
      </form>
    </div>
  );
}

export default CreatePostForm;
