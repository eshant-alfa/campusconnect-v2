"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertCircle,
  PieChart,
  Activity
} from "lucide-react";
import Link from "next/link";

interface SurveyResults {
  title: string;
  questions: Array<{
    _key: string;
    text: string;
    type: "single" | "multiple";
    options: string[];
    results: Record<string, number>; // option -> count
    total: number;
  }>;
}

export default function SurveyResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState<SurveyResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/surveys/${id}/results`);
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        setResults(data);
      } catch (e: any) {
        setError(e.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id]);

  const getBarColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ];
    return colors[index % colors.length];
  };

  const getBarGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
      'from-red-500 to-red-600'
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
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

  if (!results) return null;

  const totalResponses = results.questions[0]?.total || 0;

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Button asChild variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800">
              <Link href={`/surveys/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Survey
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Survey Results
              </h1>
              <p className="text-lg text-blue-800">{results.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 bg-white/80">
                <Users className="w-4 h-4 mr-1" />
                {totalResponses} responses
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {results.questions.map((q, questionIndex) => {
            const sortedOptions = q.options
              .map(opt => ({
                option: opt,
                count: q.results[opt] || 0,
                percent: q.total > 0 ? Math.round((q.results[opt] || 0) / q.total * 100) : 0
              }))
              .sort((a, b) => b.count - a.count);

            return (
              <Card key={q._key} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Question {questionIndex + 1}
                  </CardTitle>
                  <p className="text-lg font-semibold text-gray-900">{q.text}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {sortedOptions.map((opt, index) => (
                      <div key={opt.option} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getBarColor(index)}`}></div>
                            <span className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                              {opt.option}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {opt.count}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {opt.percent}%
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full bg-gradient-to-r ${getBarGradient(index)} transition-all duration-500 ease-out`}
                              style={{ 
                                width: `${opt.percent}%`,
                                minWidth: opt.count > 0 ? '8px' : '0px'
                              }}
                            />
                          </div>
                          {opt.count > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700 shadow-sm">
                                {opt.count} vote{opt.count !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>Total responses: <span className="font-semibold text-gray-900">{q.total}</span></span>
                      </div>
                      {q.total > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {Math.max(...sortedOptions.map(o => o.percent))}% most popular
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href={`/surveys/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Survey
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/surveys">
              <BarChart3 className="w-4 h-4 mr-2" />
              All Surveys
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
} 