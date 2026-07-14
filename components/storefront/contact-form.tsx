"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      alert("Message sent successfully!");
    }, 1000);
  };

  return (
    <div className="border border-gray-300/60 p-8 bg-paper shadow-card rounded-2xl">
      <h2 className="font-sans font-semibold text-xl text-ink mb-1.5 text-left">
        Send us a message
      </h2>
      <p className="text-gray-400 text-xs mb-8 text-left">
        Complete the form below and our staff will respond within 24 business hours.
      </p>

      {success && (
        <div className="bg-success/10 border border-success/20 text-success text-xs font-semibold p-4 rounded-xl mb-6 text-left">
          ✓ Message sent successfully! We will get back to you shortly.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-xs font-semibold text-ink uppercase tracking-wider">Your name</label>
          <input
            id="name"
            type="text"
            required
            placeholder="John Doe"
            className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-semibold text-ink uppercase tracking-wider">Email address</label>
          <input
            id="email"
            type="email"
            required
            placeholder="john@example.com"
            className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-xs font-semibold text-ink uppercase tracking-wider">Message</label>
          <textarea
            id="message"
            required
            rows={5}
            placeholder="How can we help you?"
            className="bg-canvas border border-gray-300 p-3.5 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-accent/15 focus:border-accent rounded-xl text-ink"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-3 font-semibold text-sm mt-2 flex items-center justify-center gap-1.5"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Send message</span>
        </button>
      </form>
    </div>
  );
}
