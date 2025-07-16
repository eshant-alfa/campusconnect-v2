"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import { ImageIcon, Plus, Users, Globe, Lock, Shield, Sparkles, CheckCircle, AlertCircle, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import Image from "next/image";
import { Button } from "../ui/button";
import { createCommunity } from "@/action/createCommunity";
import { useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";

function CreateCommunityButton() {
  const { user } = useUser();
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [communityType, setCommunityType] = useState("public");
  const [isSlugValid, setIsSlugValid] = useState(true);
  const [isNameValid, setIsNameValid] = useState(true);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    // Validate name
    setIsNameValid(value.length >= 3 && value.length <= 21);

    // Auto-generate slug from name
    if (!slug || slug === generateSlug(name)) {
      const newSlug = generateSlug(value);
      setSlug(newSlug);
      setIsSlugValid(newSlug.length >= 3);
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 21);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSlug(value);
    setIsSlugValid(value.length >= 3 && /^[a-z0-9-]+$/.test(value));
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please select a valid image file");
        return;
      }

      setErrorMessage("");
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setErrorMessage("");
    setImagePreview(null);
    setImageFile(null);
    setIsSlugValid(true);
    setIsNameValid(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("Community name is required");
      return;
    }

    if (!slug.trim()) {
      setErrorMessage("Community slug is required");
      return;
    }

    if (!isNameValid || !isSlugValid) {
      setErrorMessage("Please fix the validation errors before continuing");
      return;
    }

    setErrorMessage("");

    startTransition(async () => {
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

        const result = await createCommunity(
          name.trim(),
          imageBase64,
          fileName,
          fileType,
          slug.trim(),
          description.trim() || undefined,
          communityType
        );

        console.log("Community created:", result);

        if ("error" in result && result.error) {
          setErrorMessage(result.error);
        } else if ("subreddit" in result && result.subreddit) {
          setOpen(false);
          resetForm();
          router.push(`/community/${result.subreddit.slug?.current}`);
        }
      } catch (err) {
        console.error("Failed to create community", err);
        setErrorMessage("Failed to create community");
      }
    });
  };

  const getCommunityTypeInfo = (type: string) => {
    switch (type) {
      case "public":
        return {
          icon: Globe,
          label: "Public",
          description: "Anyone can view, post, and comment",
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      case "restricted":
        return {
          icon: Shield,
          label: "Restricted",
          description: "Anyone can view, but only approved users can post",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200"
        };
      case "private":
        return {
          icon: Lock,
          label: "Private",
          description: "Only approved users can view and post",
          color: "bg-red-100 text-red-800 border-red-200",
          bgColor: "bg-red-50",
          borderColor: "border-red-200"
        };
      default:
        return {
          icon: Globe,
          label: "Public",
          description: "Anyone can view, post, and comment",
          color: "bg-green-100 text-green-800 border-green-200",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
    }
  };

  const communityTypeInfo = getCommunityTypeInfo(communityType);

  // Calculate form completion percentage
  const formFields = [
    name.trim().length > 0,
    slug.trim().length > 0,
    description.trim().length > 0,
    imageFile !== null
  ];
  const completionPercentage = (formFields.filter(Boolean).length / formFields.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="w-full p-3 pl-4 flex items-center rounded-lg cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        disabled={!user}
      >
        <Plus className="w-4 h-4 mr-2" />
        {user ? "Create a Community" : "Sign in to create community"}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Create a Community
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            Build a space for your community to connect, share ideas, and grow together.
          </DialogDescription>
          
          {/* Progress Bar */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Form Progress</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </DialogHeader>
        
        <form onSubmit={handleCreateCommunity} className="space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">Error</p>
                  <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Community Name
              </label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your community name..."
                  className={`w-full h-12 px-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg ${
                    name.length > 0 
                      ? isNameValid 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  value={name}
                  onChange={handleNameChange}
                  required
                  minLength={3}
                  maxLength={21}
                />
                {name.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isNameValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Choose a memorable name for your community
                </p>
                <span className={`text-xs ${name.length > 21 ? 'text-red-500' : 'text-gray-400'}`}>
                  {name.length}/21
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                Community URL
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  campusconnect.com/community/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="your-community"
                  className={`w-full h-12 pl-[200px] pr-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                    slug.length > 0 
                      ? isSlugValid 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                  }`}
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  minLength={3}
                  maxLength={21}
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
                {slug.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isSlugValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  This will be your community's unique URL
                </p>
                <span className={`text-xs ${slug.length > 21 ? 'text-red-500' : 'text-gray-400'}`}>
                  {slug.length}/21
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Tell people what your community is about..."
                className="w-full min-h-[100px] px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Help others understand what your community is about
                </p>
                <span className={`text-xs ${description.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                  {description.length}/500
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Community Image
              </label>
              {imagePreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Community preview"
                    fill
                    className="object-cover rounded-full border-4 border-white shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200 group">
                  <CardContent className="p-8">
                    <label
                      htmlFor="community-image"
                      className="flex flex-col items-center justify-center w-full cursor-pointer"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Upload Community Image
                      </p>
                      <p className="text-xs text-gray-500 text-center mb-4">
                        Recommended: Square image, 256x256px or larger (max 5MB)
                      </p>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        Click to browse files
                      </Badge>
                      <input
                        id="community-image"
                        name="community-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                      />
                    </label>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                Community Type
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: "public", icon: Globe, label: "Public", description: "Anyone can view, post, and comment" },
                  { value: "restricted", icon: Shield, label: "Restricted", description: "Anyone can view, but only approved users can post" },
                  { value: "private", icon: Lock, label: "Private", description: "Only approved users can view and post" }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = communityType === type.value;
                  const typeInfo = getCommunityTypeInfo(type.value);
                  
                  return (
                    <label
                      key={type.value}
                      className={`relative flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isSelected
                          ? `${typeInfo.bgColor} ${typeInfo.borderColor} shadow-md`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="community-type"
                        value={type.value}
                        checked={isSelected}
                        onChange={(e) => setCommunityType(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`flex items-center h-4 w-4 mt-0.5 ${
                        isSelected ? "text-blue-600" : "text-gray-400"
                      }`}>
                        {isSelected && (
                          <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                        {!isSelected && (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <Icon className="w-5 h-5 mr-2 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {type.label}
                          </span>
                          <Badge className={`ml-2 ${typeInfo.color}`}>
                            {type.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              disabled={isPending || !user || !isNameValid || !isSlugValid}
            >
              {isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Community...
                </div>
              ) : (
                <div className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {user ? "Create Community" : "Sign in to create community"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCommunityButton;
