import React from "react";
import Image from "next/image";
import { ExternalLink, BookOpen, Heart, GraduationCap, Scale, Briefcase, Map, Bus, Search, Star, Clock, Users } from "lucide-react";

const resources = [
  {
    name: "NSW State Library",
    url: "https://www.sl.nsw.gov.au/",
    description: "Access books, digital resources, study spaces, and research help.",
    image: "/resources/library.jpg",
    category: "Academic",
    icon: BookOpen,
    featured: true,
    tags: ["Library", "Research", "Study Spaces"]
  },
  {
    name: "Headspace",
    url: "https://headspace.org.au/",
    description: "Free mental health, wellbeing, and counseling services for young people.",
    image: "/resources/mentalhealth.jpg",
    category: "Health & Wellness",
    icon: Heart,
    featured: true,
    tags: ["Mental Health", "Counseling", "Wellbeing"]
  },
  {
    name: "Study NSW",
    url: "https://www.study.sydney/",
    description: "Official NSW government support, events, and information for international and local students.",
    image: "/resources/studynsw.jpg",
    category: "Academic",
    icon: GraduationCap,
    featured: false,
    tags: ["Government", "Events", "Support"]
  },
  {
    name: "Youth Law Australia",
    url: "https://yla.org.au/",
    description: "Free, confidential legal advice for young people under 25.",
    image: "/resources/youthlaw.jpg",
    category: "Legal",
    icon: Scale,
    featured: false,
    tags: ["Legal Advice", "Confidential", "Free"]
  },
  {
    name: "Government Jobs NSW",
    url: "https://iworkfor.nsw.gov.au/",
    description: "Find and apply for government jobs and internships in New South Wales.",
    image: "/resources/careers.jpg",
    category: "Career",
    icon: Briefcase,
    featured: false,
    tags: ["Jobs", "Internships", "Government"]
  },
  {
    name: "Sydney City Map",
    url: "https://www.cityofsydney.nsw.gov.au/maps",
    description: "Free interactive map of Sydney city, including transport, attractions, and services.",
    image: "/resources/campus-map.jpg",
    category: "Navigation",
    icon: Map,
    featured: false,
    tags: ["Maps", "Navigation", "Interactive"]
  },
  {
    name: "Transport NSW",
    url: "https://transportnsw.info/",
    description: "Plan your travel to and from campus with public transport info.",
    image: "/resources/transport.jpg",
    category: "Transport",
    icon: Bus,
    featured: false,
    tags: ["Public Transport", "Planning", "Travel"]
  },
];

const categories = [
  { name: "All", value: "all", icon: Search },
  { name: "Academic", value: "Academic", icon: BookOpen },
  { name: "Health", value: "Health & Wellness", icon: Heart },
  { name: "Career", value: "Career", icon: Briefcase },
  { name: "Legal", value: "Legal", icon: Scale },
  { name: "Transport", value: "Transport", icon: Bus },
  { name: "Navigation", value: "Navigation", icon: Map },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <div className="flex items-center gap-4 mb-4">
            <BookOpen className="text-blue-700 w-14 h-14" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight drop-shadow-sm">Student Resources Hub</h1>
          </div>
          <p className="text-lg md:text-xl text-blue-700 max-w-xl">Discover essential services, support networks, and tools to help you succeed in your academic journey.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <Image
            src="/images/full_logo.png"
            alt="Campus Connect Logo"
            width={160}
            height={160}
            className="h-32 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
            priority
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Featured Resources */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {resources.filter(r => r.featured).map((resource) => (
              <FeaturedResourceCard key={resource.url} resource={resource} />
            ))}
          </div>
        </div>

        {/* All Resources */}
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-6">All Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <ResourceCard key={resource.url} resource={resource} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedResourceCard({ resource }: { resource: typeof resources[0] }) {
  const IconComponent = resource.icon;
  return (
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
        <Image
          src={resource.image}
          alt={resource.name}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 50vw"
          placeholder="empty"
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <IconComponent className="w-5 h-5 text-white" />
            <span className="text-white/80 text-sm font-medium">{resource.category}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{resource.name}</h3>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Visit Resource
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: typeof resources[0] }) {
  const IconComponent = resource.icon;
  return (
    <div className="group bg-white rounded-2xl shadow-md p-6 flex flex-col h-full hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <h3 className="font-semibold text-blue-900 text-lg">{resource.name}</h3>
      </div>
      <p className="text-gray-600 mb-3 flex-1">{resource.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {resource.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg mt-auto"
      >
        Visit Resource
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
} 