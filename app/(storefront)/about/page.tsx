import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Learn about Maurice Gadgets Hub, our commitment to genuine consumer electronics, authorized supply channels, and secure e-commerce in Ikeja, Lagos.",
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">About Us</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Our story</h1>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed flex flex-col gap-8 text-base">
        
        {/* Lead statement */}
        <p className="text-xl text-ink font-semibold leading-snug border-l-2 border-accent pl-4 font-sans">
          Maurice Gadgets Hub is built on a simple commitment: form follows function. We believe in utility, precision, and genuine, authorized quality.
        </p>

        <p>
          Founded in Ikeja, Lagos, the heart of Nigeria’s tech community, Maurice Gadgets Hub is a premium retail experience dedicated to sourcing authentic consumer tech devices. We understand that buying electronics in Nigeria can sometimes feel uncertain. That is why we built a store designed around trust, authorized supply channels, and transparent policies.
        </p>

        {/* Info card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 border border-gray-300/40 p-8 bg-paper shadow-card rounded-2xl">
          <div className="flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-base text-accent">Geometric accuracy</h3>
            <p className="text-sm text-gray-500">
              Just like our architectural design inspiration, we select products that are minimal, functional, and geometrically sound. We sell devices that are built to perform, not just to show.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-sans font-semibold text-base text-accent">Authorized origin</h3>
            <p className="text-sm text-gray-500">
              We bypass secondary wholesalers to bring products directly from authorized distributors. Every iPhone, PlayStation console, and audio accessory is verified genuine.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-sans font-semibold tracking-tight text-ink mt-4">Our promise</h2>
        <p>
          We promise that when you buy from Maurice Gadgets Hub, you receive a product covered by an official warranty, backed by responsive support, and sold at an honest price. Whether you visit our physical storefront in computer village or order online with Flutterwave secure billing, you are getting the finest retail standard in Nigeria.
        </p>

      </div>
    </main>
  );
}
