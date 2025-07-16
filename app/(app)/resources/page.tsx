"use client";

import React from "react";
import { 
  BookOpen, 
  Heart, 
  GraduationCap, 
  Scale, 
  Briefcase, 
  MapPin, 
  Bus, 
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const resources = [
  {
    name: "NSW State Library",
    url: "https://www.sl.nsw.gov.au/",
    description: "Access books, digital resources, study spaces, and research help.",
    category: "Academic",
    icon: BookOpen,
    color: "bg-blue-500",
    imageUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Headspace",
    url: "https://headspace.org.au/",
    description: "Free mental health, wellbeing, and counseling services for young people.",
    category: "Health & Wellness",
    icon: Heart,
    color: "bg-pink-500",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Study NSW",
    url: "https://www.study.sydney/",
    description: "Official NSW government support, events, and information for international and local students.",
    category: "Academic",
    icon: GraduationCap,
    color: "bg-green-500",
    imageUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Youth Law Australia",
    url: "https://yla.org.au/",
    description: "Free, confidential legal advice for young people under 25.",
    category: "Legal",
    icon: Scale,
    color: "bg-purple-500",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Government Jobs NSW",
    url: "https://iworkfor.nsw.gov.au/",
    description: "Find and apply for government jobs and internships in New South Wales.",
    category: "Career",
    icon: Briefcase,
    color: "bg-orange-500",
    imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Sydney City Map",
    url: "https://www.cityofsydney.nsw.gov.au/maps",
    description: "Free interactive map of Sydney city, including transport, attractions, and services.",
    category: "Navigation",
    icon: MapPin,
    color: "bg-red-500",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop&crop=center"
  },
  {
    name: "Transport NSW",
    url: "https://transportnsw.info/",
    description: "Plan your travel to and from campus with public transport info.",
    category: "Transport",
    icon: Bus,
    color: "bg-indigo-500",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=400&h=200&fit=crop&crop=center"
  }
];

const categories = ["All", "Academic", "Health & Wellness", "Legal", "Career", "Navigation", "Transport"];

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredResources = resources.filter((resource) => {
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
            Campus Resources
          </h1>
          <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 mb-4 mx-auto"></span>
          <p className="text-lg md:text-xl text-blue-700 max-w-2xl mx-auto font-medium mb-8">
            Essential services, support networks, and tools to help you succeed in your academic journey.
          </p>
          
          {/* Search and Filter Section */}
          <div className="max-w-2xl mx-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedCategory === category 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="max-w-7xl mx-auto py-12 px-4">
        {filteredResources.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory === "All" ? "All Resources" : `${selectedCategory} Resources`}
              </h2>
              <p className="text-gray-600">
                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => {
                const IconComponent = resource.icon;
                return (
                  <Card 
                    key={resource.url} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resource.imageUrl}
                        alt={resource.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${resource.color} text-white border-0`}>
                          {resource.category}
                        </Badge>
                      </div>
                      
                      {/* Icon Overlay */}
                      <div className="absolute bottom-4 right-4">
                        <div className={`w-12 h-12 ${resource.color} rounded-full flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {resource.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {resource.description}
                      </p>
                      
                      <Button 
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                      >
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit Resource
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Additional Info Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Student Success Tips
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Make the most of these resources to enhance your academic journey and personal development.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Academic Resources</h3>
              <p className="text-sm text-gray-600">
                Access libraries, study materials, and academic support services to excel in your studies.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Wellness Support</h3>
              <p className="text-sm text-gray-600">
                Prioritize your mental health and wellbeing with professional counseling and support services.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Career Development</h3>
              <p className="text-sm text-gray-600">
                Explore job opportunities, internships, and career guidance to prepare for your future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 px-4 bg-white border-t border-blue-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <div>
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </div>
          <div className="flex gap-4 items-center">
            <a href="mailto:info@campusconnect.com" className="hover:text-blue-700 underline">Contact</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">GitHub</a>
            <a href="/support" className="hover:text-blue-700 underline">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
} 