"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Plus, 
  GripVertical, 
  Trash2, 
  Settings, 
  FileText, 
  Calendar,
  Clock,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const questionTypes = [
  { label: "Single Choice", value: "single", icon: "○" },
  { label: "Multiple Choice", value: "multiple", icon: "☐" },
  { label: "Short Text", value: "text", icon: "T" },
  { label: "Rating (1-5)", value: "rating", icon: "★" },
];

export default function CreateSurveyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    startDate: "",
    endDate: "",
    anonymous: false,
  });
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: any = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setForm(f => ({ ...f, [name]: fieldValue }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const addQuestion = () => {
    setQuestions(qs => [
      ...qs,
      { question: "", type: "single", options: ["", ""], required: false },
    ]);
  };

  const updateQuestion = (idx: number, key: string, value: any) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === idx
          ? {
              ...q,
              [key]: value,
              ...(key === "type" && (value === "single" || value === "multiple")
                ? { options: q.options && q.options.length >= 2 ? q.options : ["", ""] }
                : { options: undefined }),
            }
          : q
      )
    );
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: (q.options ?? []).map((opt: string, j: number) => (j === optIdx ? value : opt)) }
          : q
      )
    );
  };

  const addOption = (qIdx: number) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: [...(q.options ?? []), ""] } : q
      )
    );
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setQuestions(qs =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: (q.options ?? []).filter((_: string, j: number) => j !== optIdx) } : q
      )
    );
  };

  const removeQuestion = (idx: number) => {
    setQuestions(qs => qs.filter((_, i) => i !== idx));
  };

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    setQuestions(qs => {
      const newQs = [...qs];
      const [removed] = newQs.splice(idx, 1);
      newQs.splice(idx + dir, 0, removed);
      return newQs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title || questions.length === 0) {
      setError("Title and at least one question are required.");
      return;
    }
    for (const q of questions) {
      if (!q.question) {
        setError("All questions must have text.");
        return;
      }
      if ((q.type === "single" || q.type === "multiple") && (!q.options || q.options.length < 2 || q.options.some((o: string) => !o))) {
        setError("All choice questions must have at least 2 options, and no option can be empty.");
        return;
      }
    }
    setLoading(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create survey");
      }
      const data = await res.json();
      router.push(`/surveys/${data.survey._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create survey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800">
              <Link href="/surveys">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Surveys
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                <Plus className="w-8 h-8" />
                Create Survey / Poll
              </h1>
              <p className="text-lg text-blue-800">Design and configure your survey to gather insights from your community.</p>
            </div>
            <Badge variant="outline" className="px-3 py-1 bg-white/80">
              <Settings className="w-4 h-4 mr-1" />
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Details Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-blue-600" />
                Survey Details
              </CardTitle>
              <CardDescription>Set the basics for your survey or poll</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="title" 
                  name="title" 
                  value={form.title} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="Enter your survey title..."
                  className="h-12 text-base border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  value={form.description} 
                  onChange={handleFormChange} 
                  rows={3} 
                  placeholder="Provide a brief description of your survey..."
                  className="border-gray-200 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    Status
                  </Label>
                  <select 
                    id="status" 
                    name="status" 
                    value={form.status} 
                    onChange={handleSelectChange} 
                    className="w-full h-12 border border-gray-200 rounded-md px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Start Date
                  </Label>
                  <Input 
                    id="startDate" 
                    name="startDate" 
                    type="datetime-local" 
                    value={form.startDate} 
                    onChange={handleFormChange}
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    End Date
                  </Label>
                  <Input 
                    id="endDate" 
                    name="endDate" 
                    type="datetime-local" 
                    value={form.endDate} 
                    onChange={handleFormChange}
                    className="h-12 text-base border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <input 
                  id="anonymous" 
                  name="anonymous" 
                  type="checkbox" 
                  checked={form.anonymous} 
                  onChange={handleFormChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="anonymous" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  {form.anonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Anonymous responses
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Questions Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-green-600" />
                Questions
              </CardTitle>
              <CardDescription>Add, edit, and reorder questions for your survey</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md transition-all duration-200 relative group">
                  <div className="flex gap-2 absolute right-4 top-4">
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => moveQuestion(idx, -1)} 
                      disabled={idx === 0}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => moveQuestion(idx, 1)} 
                      disabled={idx === questions.length - 1}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => removeQuestion(idx)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <Badge variant="outline" className="text-xs">
                      Question {idx + 1}
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">
                        Question <span className="text-red-500">*</span>
                      </Label>
                      <Input 
                        value={q.question} 
                        onChange={e => updateQuestion(idx, "question", e.target.value)} 
                        required 
                        placeholder="Enter your question..."
                        className="border-gray-200 focus:border-blue-500"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Type</Label>
                      <select 
                        value={q.type} 
                        onChange={e => updateQuestion(idx, "type", e.target.value)} 
                        className="w-full border border-gray-200 rounded-md px-3 py-2 text-base focus:border-blue-500 focus:outline-none"
                      >
                        {questionTypes.map(t => (
                          <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(q.type === "single" || q.type === "multiple") && (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">
                          Options <span className="text-red-500">*</span>
                        </Label>
                        <div className="space-y-2">
                          {(q.options ?? []).map((opt: string, optIdx: number) => (
                            <div key={optIdx} className="flex gap-2 items-center">
                              <Input 
                                value={opt} 
                                onChange={e => updateOption(idx, optIdx, e.target.value)} 
                                required 
                                placeholder={`Option ${optIdx + 1}...`}
                                className="flex-1 border-gray-200 focus:border-blue-500"
                              />
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeOption(idx, optIdx)} 
                                disabled={(q.options ?? []).length <= 2}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addOption(idx)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <input 
                        type="checkbox" 
                        checked={q.required} 
                        onChange={e => updateQuestion(idx, "required", e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label className="text-sm font-medium text-gray-700">Required question</Label>
                    </div>
      </div>
    </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addQuestion}
                className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" asChild size="lg">
              <Link href="/surveys">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg font-semibold px-8"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Survey
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
} 