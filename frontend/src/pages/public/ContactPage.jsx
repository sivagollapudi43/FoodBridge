import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Have questions about partnering as a commercial food donor, registering your NGO, or
          volunteering? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900">FoodBridge Support Center</h3>

          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Email Inquiries</p>
                <p>support@foodbridge.org</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Emergency Food Rescue Hotline</p>
                <p>+91 (80) 4123-9900 (Mon - Sun, 8 AM - 11 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800">Headquarters</p>
                <p>FoodBridge Foundation, MG Road, Bangalore 560001, Karnataka, India</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
              <p className="text-sm font-bold text-emerald-800">Message Received!</p>
              <p className="text-xs text-emerald-700 mt-1">
                Thank you, {name}. A member of our community response team will reply within 4 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Varma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="anand@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Tell us about your organization or inquiry..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
