"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteSurveyButton from "@/components/surveys/DeleteSurveyButton";
import { BarChart3, Plus, Calendar, Users, CheckCircle, Clock } from "lucide-react";

export default function SurveysPage() {
  const { userId } = useAuth();
  const [surveys, setSurveys] = useState<any[]>([]);
  const [mySurveys, setMySurveys] = useState<any[]>([]);
  const [closedSurveys, setClosedSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'closed'>('all');

  useEffect(() => {
    setLoading(true);
    fetch("/api/surveys")
      .then(res => res.json())
      .then(data => {
        setSurveys(data.surveys || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load surveys");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (userId) {
      fetch("/api/surveys/my-surveys")
        .then(res => res.json())
        .then(data => {
          setMySurveys(data.surveys || []);
        })
        .catch(() => {
          // Silently fail for my surveys
        });
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch("/api/surveys/closed-surveys")
        .then(res => res.json())
        .then(data => {
          setClosedSurveys(data.surveys || []);
        })
        .catch(() => {
          // Silently fail for closed surveys
        });
    }
  }, [userId]);

  const renderSurveyCard = (survey: any, showStatus = false, showDelete = false) => (
    <Card key={survey._id} className="h-full hover:shadow-xl transition-all duration-300 hover:border-blue-400 group bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors leading-tight">
              {survey.title}
            </CardTitle>
            {survey.description && (
              <CardDescription className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                {survey.description}
              </CardDescription>
            )}
          </div>
          {showStatus && (
            <Badge 
              variant={survey.status === 'closed' ? 'destructive' : survey.status === 'published' ? 'default' : 'secondary'}
              className="shrink-0 px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            >
              {survey.status === 'published' ? 'Active' : survey.status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-3 text-sm text-gray-600 mb-6">
          {survey.startDate && (
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Starts: {new Date(survey.startDate).toLocaleDateString()}</span>
            </div>
          )}
          {survey.endDate && (
            <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="font-medium">Ends: {new Date(survey.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button asChild variant="outline" className="flex-1 group-hover:border-blue-400 group-hover:text-blue-700 group-hover:bg-blue-50 transition-all duration-200 font-semibold">
            <Link href={`/surveys/${survey._id}`} className="flex items-center gap-2">
              {survey.status === 'closed' ? (
                <>
                  <BarChart3 className="w-4 h-4" />
                  View Results
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  View & Vote
                </>
              )}
            </Link>
          </Button>
          {showDelete && survey.status === 'closed' && (
            <DeleteSurveyButton
              surveyId={survey._id}
              surveyTitle={survey.title}
              onDelete={() => {
                setClosedSurveys(prev => prev.filter(s => s._id !== survey._id));
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderEmptyState = (title: string, description: string, showCreateButton = false) => (
    <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-8 text-center">
      <div className="text-gray-400 mb-4">
        <BarChart3 className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {showCreateButton && (
        <Button asChild>
          <Link href="/surveys/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Survey
          </Link>
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-200 border-b">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-blue-900 mb-2 flex items-center gap-3">
                <BarChart3 className="w-10 h-10" />
                Surveys & Polls
              </h1>
              <p className="text-lg text-blue-800 max-w-2xl">
                Create and participate in surveys to gather insights from your campus community.
              </p>
            </div>
            <Button asChild size="lg" className="bg-blue-700 hover:bg-blue-800">
              <Link href="/surveys/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Survey
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-7xl mx-auto mt-10 px-4">
        {/* Tab Navigation */}
        {userId && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 mb-8">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'all' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('all')}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Users className="w-4 h-4 mr-2" />
                All Surveys
              </Button>
              <Button
                variant={activeTab === 'my' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('my')}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'my' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                My Active
              </Button>
              <Button
                variant={activeTab === 'closed' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('closed')}
                className={`flex-1 h-12 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'closed' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                My Closed
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          renderLoadingSkeletons()
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Surveys</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'all' && surveys.length > 0 && surveys.map(survey => renderSurveyCard(survey))}
            {activeTab === 'my' && mySurveys.length > 0 && mySurveys.map(survey => renderSurveyCard(survey, true))}
            {activeTab === 'closed' && closedSurveys.length > 0 && closedSurveys.map(survey => renderSurveyCard(survey, true, true))}
          </div>
        )}

        {/* Empty States */}
        {!loading && !error && activeTab === 'all' && surveys.length === 0 && 
          renderEmptyState("No Surveys Available", "There are no surveys available at the moment.", true)
        }
        {!loading && !error && activeTab === 'my' && mySurveys.length === 0 && 
          renderEmptyState("No Active Surveys", "You haven't created any active surveys yet.", true)
        }
        {!loading && !error && activeTab === 'closed' && closedSurveys.length === 0 && 
          renderEmptyState("No Closed Surveys", "You don't have any closed surveys yet.", false)
        }
      </section>
    </>
  );
} 