import React from 'react';
import { ShieldCheck, Users, MessageCircle, ShoppingBag, Bell, Lock, Globe, Megaphone, Mail, UserCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100">
      {/* Hero Section */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-16 bg-gradient-to-r from-blue-200 via-white to-blue-100 rounded-b-3xl shadow-lg mb-12">
        <div className="flex-1 flex flex-col items-start md:items-start">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-4 leading-tight drop-shadow-sm">The heart of your campus</h1>
          <p className="text-xl md:text-2xl text-blue-700 mb-6 max-w-xl">Campus Connect brings students, staff, and communities together for authentic connection, resource sharing, and campus life all in one safe, modern platform.</p>
        </div>
        <div className="flex-1 flex justify-center md:justify-end mt-8 md:mt-0">
          <img
            src="/images/full_logo.png"
            alt="Campus Connect Logo"
            className="h-48 w-auto rounded-2xl shadow-xl border-4 border-white bg-white"
          />
        </div>
      </section>

      {/* How It Works / Features */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-4 mb-16">
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-blue-300">
          <MessageCircle className="w-12 h-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Post & Discuss</h2>
          <p className="text-gray-600">Share ideas, ask questions, and join conversations in vibrant campus communities.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-green-300">
          <ShoppingBag className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Marketplace</h2>
          <p className="text-gray-600">Buy, sell, or exchange goods and services with trusted campus members.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-yellow-300">
          <Bell className="w-12 h-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stay Informed</h2>
          <p className="text-gray-600">Get real-time alerts, campus news, and access essential student resources.</p>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 bg-blue-100 rounded-2xl p-8 shadow flex flex-col items-center text-center mb-6 md:mb-0">
            <UserCheck className="w-10 h-10 text-blue-700 mb-2" />
            <h3 className="text-xl font-bold mb-2">Our Mission</h3>
            <p className="text-gray-700">To enrich campus life by providing a secure, inclusive, and innovative platform for communication, resource sharing, and community building.</p>
          </div>
          <div className="flex-1 bg-green-100 rounded-2xl p-8 shadow flex flex-col items-center text-center">
            <Megaphone className="w-10 h-10 text-green-700 mb-2" />
            <h3 className="text-xl font-bold mb-2">Our Vision</h3>
            <p className="text-gray-700">To be the leading digital ecosystem for campus communities, recognized for trust, transparency, and positive impact on student and stakeholder experiences.</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl md:text-3xl font-bold">Our Core Values</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {/* Privacy & Safety */}
          <div className="flex items-start gap-3">
            <Lock className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <div className="font-bold text-lg mb-1">Privacy &amp; Safety:</div>
              <div className="text-gray-700">We prioritize user privacy and data protection, implementing industry-leading security standards and transparent policies.</div>
            </div>
          </div>
          {/* Inclusivity */}
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-green-400 mt-1" />
            <div>
              <div className="font-bold text-lg mb-1">Inclusivity:</div>
              <div className="text-gray-700">We celebrate diversity and foster a welcoming environment for all backgrounds and perspectives.</div>
            </div>
          </div>
          {/* Transparency */}
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 text-purple-400 mt-1" />
            <div>
              <div className="font-bold text-lg mb-1">Transparency:</div>
              <div className="text-gray-700">We are open about our practices, policies, and platform changes, and regularly publish updates for our community.</div>
            </div>
          </div>
          {/* Empowerment */}
          <div className="flex items-start gap-3">
            <UserCheck className="w-6 h-6 text-yellow-400 mt-1" />
            <div>
              <div className="font-bold text-lg mb-1">Empowerment:</div>
              <div className="text-gray-700">We enable users to create, moderate, and participate in communities that matter to them.</div>
            </div>
          </div>
          {/* Continuous Improvement */}
          <div className="flex items-start gap-3 md:col-span-2">
            <Megaphone className="w-6 h-6 text-pink-400 mt-1" />
            <div>
              <div className="font-bold text-lg mb-1">Continuous Improvement:</div>
              <div className="text-gray-700">We listen, learn, and evolve to meet the needs of our users and stakeholders.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Social */}
      <section className="max-w-4xl mx-auto px-4 mb-20">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-8 h-8 text-red-500" />
          <h2 className="text-2xl font-bold">Contact & Connect</h2>
        </div>
        <p className="text-gray-700 text-base mb-2">
          For questions, feedback, or partnership opportunities, email us at <a href="mailto:support@campusconnect.com" className="text-blue-600 underline">support@campusconnect.com</a>.
        </p>
        <div className="flex gap-4 mt-2">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" className="text-gray-500 hover:text-blue-600 text-2xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" className="text-gray-500 hover:text-blue-400 text-2xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" className="text-gray-500 hover:text-blue-700 text-2xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.77 24h20.459C23.208 24 24 23.229 24 22.271V1.723C24 .771 23.208 0 22.23 0zM7.12 20.452H3.56V9h3.56v11.452zM5.34 7.633a2.07 2.07 0 1 1 0-4.141 2.07 2.07 0 0 1 0 4.14zm15.112 12.819h-3.554v-5.569c0-1.328-.025-3.037-1.85-3.037-1.85 0-2.132 1.445-2.132 2.939v5.667h-3.554V9h3.414v1.561h.049c.476-.899 1.637-1.85 3.37-1.85 3.602 0 4.267 2.37 4.267 5.455v6.286z"/></svg>
          </a>
        </div>
      </section>

      <footer className="mt-12 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
      </footer>
    </main>
  );
} 