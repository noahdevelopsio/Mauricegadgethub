export default function FAQPage() {
  const faqs = [
    {
      q: "Are all your products genuine?",
      a: "Yes. Every single phone, laptop, console, game disc, and audio accessory we sell is 100% genuine and sourced directly from official global brand distributors."
    },
    {
      q: "Do you offer warranty on purchased items?",
      a: "Absolutely. All electronic devices carry our official showroom warranty, which covers manufacturer defects. Please check our Warranty Policy page for specific brand duration terms."
    },
    {
      q: "How long does shipping take within Nigeria?",
      a: "Lagos deliveries take between 24 to 48 business hours. Deliveries outside Lagos (handled via secure logistics partners) typically take 3 to 5 business days."
    },
    {
      q: "Can I pay on delivery?",
      a: "No, we do not support pay-on-delivery. All orders placed through our e-commerce platform are processed securely via Flutterwave card, bank transfer, or USSD payments. Alternatively, you can select 'In-Store Pickup' and pay in person at our Ikeja outlet."
    },
    {
      q: "What is your return policy?",
      a: "We allow returns on factory-sealed, unused products within 7 days of delivery. If a device has an out-of-box manufacturer failure, we will replace it immediately upon verification."
    },
    {
      q: "Can a diaspora buyer order for delivery in Nigeria?",
      a: "Yes. Diaspora buyers can purchase gadgets using international payment cards at checkout, and enter the local shipping address of their family/recipients in Nigeria."
    }
  ];

  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Support</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Frequently asked questions</h1>
      </div>

      <div className="flex flex-col gap-6 font-sans">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border border-gray-300/60 p-6 bg-paper shadow-card rounded-2xl flex flex-col gap-2.5">
            <h3 className="font-sans font-semibold text-[15px] text-accent leading-snug flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 select-none">Q.</span>
              {faq.q}
            </h3>
            <p className="text-gray-600 text-sm pl-4 leading-relaxed font-normal">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
