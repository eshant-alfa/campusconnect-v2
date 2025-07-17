"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Lock,
  Radio,
  CheckSquare
} from "lucide-react";
import Link from "next/link";

interface Survey {
  _id: string;
  title: string;
  description?: string;
  status: string;
  creator?: {
    clerkId: string;
  };
  questions: Array<{
    _key: string;
    question: string;
    type: "single" | "multiple";
    options: string[];
  }>;
}

export default function SurveyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/surveys/${id}`);
        if (!res.ok) throw new Error("Survey not found");
        const data = await res.json();
        console.log('Fetched survey data:', data);
        console.log('Questions with keys:', data.questions?.map((q: any) => ({ question: q.question, _key: q._key })));
        setSurvey(data);
        
        // Check if user has already voted (only for authenticated users)
        if (userId && !data.anonymous) {
          const voteCheckRes = await fetch(`/api/surveys/${id}/has-voted`);
          if (voteCheckRes.ok) {
            const { hasVoted: userHasVoted } = await voteCheckRes.json();
            setHasVoted(userHasVoted);
          }
        }
        
        // Check if current user is the creator
        if (userId && data.creator?.clerkId === userId) {
          setIsCreator(true);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load survey");
      } finally {
        setLoading(false);
      }
    }
    fetchSurvey();
  }, [id, userId]);

  const handleChange = (qKey: string | undefined, value: string | string[]) => {
    if (!qKey) {
      console.warn('Survey question is missing _key. This will break results aggregation.');
      return;
    }
    setResponses((prev) => ({ ...prev, [qKey]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/surveys/${id}/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      if (!res.ok) throw new Error("Failed to submit response");
      setHasVoted(true);
    } catch (e: any) {
      setSubmitError(e.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSurvey = async () => {
    if (!confirm('Are you sure you want to close this survey? This action cannot be undone.')) {
      return;
    }
    
    setClosing(true);
    try {
      const res = await fetch(`/api/surveys/${id}/close`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to close survey');
      }
      
      // Refresh the page to show updated status
      window.location.reload();
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to close survey');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-2">
                  {[...Array(4)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-3/4" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!survey) return null;

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
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-blue-900">{survey.title}</h1>
                <Badge 
                  variant={survey.status === 'closed' ? 'destructive' : 'default'}
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                >
                  {survey.status === 'closed' ? 'Closed' : 'Active'}
                </Badge>
              </div>
              {survey.description && (
                <p className="text-lg text-blue-800 max-w-2xl">{survey.description}</p>
              )}
            </div>
            {isCreator && survey.status !== 'closed' && (
              <Button 
                onClick={handleCloseSurvey} 
                variant="destructive" 
                size="lg"
                disabled={closing}
                className="bg-red-600 hover:bg-red-700"
              >
                <Lock className="w-4 h-4 mr-2" />
                {closing ? 'Closing...' : 'Close Survey'}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        {survey.status === 'closed' && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Clock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 font-medium">
              This survey is closed and no longer accepting responses.
            </AlertDescription>
          </Alert>
        )}
        
        {hasVoted ? (
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
                <p className="text-gray-600 mb-6">You have already participated in this survey.</p>
              </div>
              <Button 
                onClick={() => router.push(`/surveys/${id}/results`)} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </CardContent>
          </Card>
        ) : survey.status === 'closed' ? (
          <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <BarChart3 className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Closed</h2>
                <p className="text-gray-600 mb-6">This survey is no longer accepting responses.</p>
              </div>
              <Button 
                onClick={() => router.push(`/surveys/${id}/results`)} 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Results
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {(survey.questions ?? [])
              .filter((q) => !!q._key)
              .map((q, idx) => (
                <Card key={q._key} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {q.type === "single" ? (
                        <Radio className="w-5 h-5 text-blue-600" />
                      ) : (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      )}
                      Question {idx + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-lg font-semibold text-gray-900 mb-4">{q.question}</p>
                    <div className="space-y-3">
                      {q.type === "single" ? (
                        (q.options ?? []).map((opt, optIdx) => (
                          <label key={`${q._key}-${optIdx}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name={q._key}
                              value={opt}
                              checked={responses[q._key] === opt}
                              onChange={() => handleChange(q._key, opt)}
                              required
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-gray-900 font-medium">{opt}</span>
                          </label>
                        ))
                      ) : (
                        (q.options ?? []).map((opt, optIdx) => (
                          <label key={`${q._key}-${optIdx}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              name={q._key}
                              value={opt}
                              checked={Array.isArray(responses[q._key]) && (responses[q._key] as string[]).includes(opt)}
                              onChange={(e) => {
                                const prev = Array.isArray(responses[q._key]) ? (responses[q._key] as string[]) : [];
                                if (e.target.checked) {
                                  handleChange(q._key, [...prev, opt]);
                                } else {
                                  handleChange(q._key, prev.filter((v) => v !== opt));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-900 font-medium">{opt}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            
            {(survey.questions ?? []).some((q) => !q._key) && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 font-medium">
                  Warning: One or more questions are missing a unique key. Please edit and re-save this survey in Sanity Studio.
                </AlertDescription>
              </Alert>
            )}
            
            {submitError && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">{submitError}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              disabled={submitting} 
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg font-semibold py-3"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit Response
                </>
              )}
            </Button>
          </form>
        )}
      </section>
    </>
  );
} 