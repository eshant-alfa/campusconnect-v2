import React from "react";
import {
  Users,
  ShoppingBag,
  MessageCircle,
  BookOpen,
  Calendar,
  ShieldCheck,
  BarChart,
  Lock,
  User,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "Join Academic Communities",
    desc: "Connect with peers, join or create groups for classes, clubs, and interests.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace for Students",
    desc: "Buy, sell, or exchange goods and services safely within your campus network.",
  },
  {
    icon: BookOpen,
    title: "Free Resources & Alerts",
    desc: "Access study materials, campus resources, and receive important alerts.",
  },
  {
    icon: BarChart,
    title: "Surveys & Polls",
    desc: "Share your voice and participate in campus-wide surveys and polls.",
  },
  {
    icon: Calendar,
    title: "Notice Board & Events",
    desc: "Stay updated with campus events, notices, and opportunities.",
  },
  {
    icon: MessageCircle,
    title: "Messaging & Notifications",
    desc: "Collaborate and communicate instantly with students and groups.",
  },
];

const values = [
  "Academic Integrity",
  "Student Safety",
  "Community Engagement",
  "Accessibility & Inclusion",
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up with University Email",
    desc: "Quick, secure registration ensures a trusted student community.",
  },
  {
    step: 2,
    title: "Join or Create Communities",
    desc: "Find your groups or start new ones for any academic or social interest.",
  },
  {
    step: 3,
    title: "Share Resources & Connect",
    desc: "Post, comment, and collaborate with your campus peers.",
  },
  {
    step: 4,
    title: "Stay Updated with Alerts & Notices",
    desc: "Get real-time updates on events, resources, and campus news.",
  },
];

const team = [
  { name: "Eshant Neupane", role: "Co-Founder" },
  { name: "Prashant Timilsina", role: "Co-Founder" },
];

export default function AboutPage() {
  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <img src="/cc_full_logo.png" alt="Campus Connect Logo" className="h-60 md:h-60 mb-3 mx-auto drop-shadow-lg" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">About Campus Connect</h1>
        <p className="text-lg md:text-xl text-blue-700 max-w-2xl mx-auto font-medium">
          Empowering students to connect, collaborate, and thrive in a safe, vibrant academic community.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-2">Our Mission</h2>
        <p className="text-base md:text-lg text-slate-700 leading-relaxed">
          Campus Connect is dedicated to building a trusted digital space for university students. Our mission is to foster collaboration, academic support, and student safety by providing seamless tools for communication, resource sharing, and community engagement.
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Key Features & Benefits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start border border-blue-100 hover:shadow-md transition">
              <f.icon className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-blue-900 mb-1">{f.title}</h3>
              <p className="text-slate-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-5xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">How It Works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {howItWorks.map((step) => (
            <li key={step.step} className="flex flex-col items-center bg-blue-50 rounded-lg p-6 border border-blue-100">
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl font-bold mb-3">
                {step.step}
              </span>
              <h4 className="text-blue-900 font-semibold mb-1 text-center">{step.title}</h4>
              <p className="text-slate-600 text-sm text-center">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Values Section */}
      <section className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Our Values</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
          {values.map((v) => (
            <li key={v} className="bg-white rounded-lg border border-blue-100 py-4 px-2 text-blue-700 font-medium shadow-sm">
              {v}
            </li>
          ))}
        </ul>
      </section>

      {/* Team/Credits Section (Optional) */}
      <section className="max-w-3xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">Meet the Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
          {team.map((member) => (
            <div key={member.name} className="flex items-center gap-4 bg-blue-50 rounded-lg p-4 w-full max-w-xs border border-blue-100">
              <User className="w-10 h-10 text-blue-400" />
          <div>
                <div className="font-semibold text-blue-900">{member.name}</div>
                <div className="text-blue-700 text-sm">{member.role}</div>
        </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-10 h-10 text-blue-600 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 drop-shadow-sm">Ready to Join Campus Connect?</h2>
          <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 mb-4"></span>
          <p className="text-xl md:text-2xl text-blue-700 font-semibold">Sign up to get started and unlock your campus experience!</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 px-4 bg-white border-t border-blue-100 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-600 text-sm">
          <div>
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </div>
          <div className="flex gap-4 items-center">
            <a href="mailto:info@campusconnect.com" className="hover:text-blue-700 underline">Contact</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">LinkedIn</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 underline">GitHub</a>
            <Link href="/support" className="hover:text-blue-700 underline">Support</Link>
      </div>
    </div>
      </footer>
    </main>
  );
} 