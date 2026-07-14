export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12 bg-canvas">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Legal</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Privacy policy</h1>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed flex flex-col gap-6 text-sm">
        <h2 className="text-xl font-sans font-semibold text-ink mt-4">1. Information we collect</h2>
        <p className="text-gray-500">
          We collect personal details that you provide during checkout or signup. This includes your name, email address, phone number, delivery address, and payment transaction details.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">2. Processing payments</h2>
        <p className="text-gray-500">
          We do not store credit card credentials on our servers. All financial transactions are processed securely via Flutterwave, our payment gateway provider.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">3. Data usage</h2>
        <p className="text-gray-500">
          Your information is used solely to process checkout orders, send shipping confirmations, verify payment fraud, and respond to support messages. We do not sell your personal data to third parties.
        </p>
      </div>
    </main>
  );
}
