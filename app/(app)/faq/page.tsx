'use client';

import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    question: "Why was my post blocked?",
    answer:
      "Your content may have contained language or references that violate our community guidelines. Please review the Moderation Policy and revise your post to remove any flagged content.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "Go to Settings > Security > Reset Password. Follow the instructions sent to your email to complete the reset.",
  },
  {
    question: "Who can see my posts?",
    answer:
      "By default, only members of the community where you posted can see your posts. You can adjust privacy settings in your profile.",
  },
  {
    question: "How do I report inappropriate content or users?",
    answer:
      "Click the Report button on any post, comment, or user profile. Our moderators will review the report as soon as possible.",
  },
  {
    question: "How do I join or leave a community?",
    answer:
      "Visit the community page and click the Join or Leave button at the top. You can join as many communities as you like!",
  },
  {
    question: "How do I contact support?",
    answer:
      "Click Support in the sidebar or email support@campusconnect.com. Our team is here to help!",
  },
  {
    question: "How do I create a survey or poll?",
    answer:
      "Go to the Surveys section and click Create Survey. Fill in your questions and options, then publish your survey.",
  },
  {
    question: "How does content moderation work?",
    answer:
      "All content is checked in real-time by AI for harmful, explicit, or inappropriate language. See the Moderation Policy for details.",
  },
];

export default function FAQPage() {
  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <HelpCircle className="h-14 w-14 text-blue-600 mb-2" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">Frequently Asked Questions (FAQ)</h1>
        <p className="text-base md:text-lg text-blue-700 max-w-2xl mx-auto font-medium mb-2">
          Find answers to the most common questions about using Campus Connect. If you need more help, contact our support team.
        </p>
        <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 mb-2"></span>
      </section>

      {/* FAQ Content */}
      <section className="max-w-3xl mx-auto py-10 px-4">
        <div className="space-y-10">
          {FAQS.map((faq, idx) => (
            <div key={faq.question}>
              <h2 className="text-xl font-bold text-blue-800 mb-2">{idx + 1}. {faq.question}</h2>
              <p className="text-slate-700 text-base md:text-lg">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
} 