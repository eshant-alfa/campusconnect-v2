'use client';

import React from "react";
import { ShieldCheck, AlertTriangle, BookOpen } from "lucide-react";

export default function ModerationPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-8">
          <ShieldCheck className="h-14 w-14 text-blue-600 mb-2" />
          <h1 className="text-4xl font-extrabold text-center text-blue-900 mb-2">Moderation Policy</h1>
          <p className="text-blue-700 text-center text-lg max-w-2xl mb-2">
            Our moderation policy explains how Campus Connect keeps the platform safe, inclusive, and respectful for everyone.
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            What is Moderation?
          </h2>
          <p className="text-gray-800 mb-2">
            All posts, comments, and community content are automatically checked by our AI moderation system. Content that violates our guidelines is blocked before it is published. Users can also report content for review by moderators.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            Prohibited Content Categories
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-900">
            <li><b>Profanity & Swearing:</b> Use of offensive or vulgar language.</li>
            <li><b>Hate Speech & Slurs:</b> Any language that attacks or demeans individuals or groups based on race, ethnicity, gender, sexuality, religion, or disability.</li>
            <li><b>Violent or Threatening Language:</b> Threats, encouragement, or descriptions of violence, harm, or illegal activity.</li>
            <li><b>Harassment & Insults:</b> Personal attacks, bullying, or repeated negative targeting of individuals.</li>
            <li><b>Sexual Content & Explicit Material:</b> Sexually explicit, suggestive, or adult content, including references to sexual acts or body parts.</li>
            <li><b>Extremist & Terrorist Content:</b> Promotion or encouragement of extremist, terrorist, or violent ideologies.</li>
            <li><b>Self-Harm & Suicide References:</b> Content that promotes, encourages, or describes self-harm or suicide.</li>
            <li><b>Drugs & Illegal Activity:</b> Discussion or promotion of illegal drugs, substances, or criminal activity.</li>
            <li><b>Academic Cheating & Plagiarism:</b> Encouraging or facilitating cheating, plagiarism, or academic dishonesty.</li>
            <li><b>Sensitive & Banned Topics:</b> Content related to child abuse, sexual assault, bestiality, necrophilia, genocide, or other highly sensitive or illegal topics.</li>
          </ul>
          <p className="text-gray-600 mt-4 text-sm">
            <b>Note:</b> This is not an exhaustive list. Any content that is hateful, violent, explicit, illegal, or otherwise harmful may be blocked or removed.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            How Moderation Works
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-900">
            <li>All content is checked in real-time by AI before it is posted.</li>
            <li>Flagged content is blocked and users see a warning with suggestions to revise.</li>
            <li>Users can report any content or user for review by moderators.</li>
            <li>Moderators may remove content, ban users, or take other actions as needed.</li>
            <li>Appeals can be made by contacting support if you believe your content was unfairly blocked.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            What To Do If Your Content Is Blocked
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-900">
            <li>Read the warning message and review the list of prohibited content categories above.</li>
            <li>Edit your post or comment to remove any flagged language or references.</li>
            <li>If you believe your content was blocked in error, contact support for review.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            Need Help?
          </h2>
          <p className="text-gray-800">If you have questions about moderation or need to appeal a decision, please contact <a href="mailto:support@campusconnect.com" className="text-blue-700 underline">support@campusconnect.com</a>.</p>
        </section>
      </div>
    </div>
  );
} 