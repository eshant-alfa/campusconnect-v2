"use client";

export default function PrivacyPolicyPage() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return (
    <main className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen w-full">
      {/* Hero Section */}
      <section className="w-full py-16 px-4 flex flex-col items-center text-center bg-gradient-to-r from-blue-100/60 to-white">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">Privacy Policy</h1>
        <p className="text-base md:text-lg text-blue-700 max-w-2xl mx-auto font-medium mb-2">
          Last updated: <span className="font-semibold">{formattedDate}</span>
        </p>
        <span className="block w-16 h-1 rounded-full bg-gradient-to-r from-blue-400 to-blue-700 mb-2"></span>
        <p className="text-blue-700 text-base md:text-lg max-w-2xl mx-auto">Your privacy is important to us. This policy explains how Campus Connect collects, uses, and protects your information.</p>
      </section>

      {/* Policy Content */}
      <section className="max-w-3xl mx-auto py-10 px-4">
        <div className="space-y-10">
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">1. Introduction</h2>
            <p className="text-slate-700">Welcome to Campus Connect ("we", "our", or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services. By using our platform, you agree to the terms of this Privacy Policy.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">2. Information We Collect</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pl-4">
              <li>Personal Information (e.g., name, email address, profile information)</li>
              <li>Usage Data (e.g., pages visited, actions taken, device information)</li>
              <li>Cookies and Tracking Technologies</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pl-4">
              <li>To provide, operate, and maintain our services</li>
              <li>To improve, personalize, and expand our platform</li>
              <li>To communicate with you, including for support and updates</li>
              <li>To monitor usage and detect/prevent fraud or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">4. How We Share Your Information</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pl-4">
              <li>With service providers who help us operate our platform</li>
              <li>With your consent or at your direction</li>
              <li>For legal reasons (e.g., to comply with laws, regulations, or legal requests)</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">5. Data Security</h2>
            <p className="text-slate-700">We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">6. Your Rights and Choices</h2>
            <ul className="list-disc list-inside text-slate-700 space-y-1 pl-4">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of certain communications</li>
              <li>Manage cookie preferences</li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">7. Children's Privacy</h2>
            <p className="text-slate-700">Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">8. Changes to This Policy</h2>
            <p className="text-slate-700">We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date above.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2">9. Contact Us</h2>
            <p className="text-slate-700">If you have any questions about this Privacy Policy, please contact us at <span className="underline text-blue-700">info@campusconnect.com</span>.</p>
          </div>
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
            <a href="/support" className="hover:text-blue-700 underline">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
} 