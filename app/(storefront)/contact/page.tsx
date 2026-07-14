import { createClient } from "@/lib/supabase/server";
import ContactForm from "@/components/storefront/contact-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Location",
  description: "Get in touch with Maurice Gadgets Hub in Ikeja, Lagos. Call, email, or message us on WhatsApp, and find our physical showroom location map.",
};

export const revalidate = 0; // Always retrieve live settings on contact page

export default async function ContactPage() {
  let showroomAddress = "Maurice Gadgets Hub, Ikeja Computer Village, Lagos, Nigeria.";
  let contactEmail = "support@mauricegadgetshub.com";
  let contactPhone = "+234 801 234 5678";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("contact_email, contact_phone, showroom_address")
      .eq("id", 1)
      .single();

    if (data) {
      if (data.showroom_address) showroomAddress = data.showroom_address;
      if (data.contact_email) contactEmail = data.contact_email;
      if (data.contact_phone) contactPhone = data.contact_phone;
    }
  } catch (error) {
    console.error("Error loading store contact settings:", error);
  }

  const cleanPhone = contactPhone.replace(/\s+/g, "");

  return (
    <main className="max-w-7xl mx-auto py-20 px-6 md:px-12">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Support</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Contact & location</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 font-sans">
        
        {/* Left Col: Contact info */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="border border-gray-300/60 p-8 bg-paper shadow-card rounded-2xl flex flex-col gap-6 text-left">
            <div>
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-accent mb-2">Showroom address</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {showroomAddress}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-accent mb-2">Email support</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium lowercase">
                  {contactEmail}
                </p>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-accent mb-2">Phone contact</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  {contactPhone}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-accent mb-2">Working hours</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Monday - Saturday: 9:00 AM - 6:00 PM<br />
                Sunday: Closed
              </p>
            </div>

            <div>
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wider text-accent mb-2">Direct messaging</h3>
              <p className="text-gray-500 text-sm mb-4 leading-relaxed font-medium">
                Need quick support or bulk order pricing? Message us directly on WhatsApp.
              </p>
              <a
                href={`https://wa.me/${cleanPhone.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-center font-semibold text-xs bg-accent hover:bg-accent-dark text-white py-3 px-6 rounded-full transition-transform active:scale-95 duration-200"
              >
                Message on WhatsApp
              </a>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="border border-gray-300/60 bg-gray-300/10 rounded-2xl aspect-video flex flex-col items-center justify-center p-8 text-center shadow-card select-none">
            <span className="text-2xl mb-2">📍</span>
            <h4 className="font-sans font-semibold text-xs uppercase tracking-wider text-ink mb-1">Showroom map</h4>
            <p className="text-gray-400 text-xs max-w-xs font-sans mt-1">
              Interactive Google Maps showroom path locator.
            </p>
          </div>
        </div>

        {/* Right Col: Contact Form */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

      </div>
    </main>
  );
}
