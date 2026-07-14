export default function TermsOfServicePage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12 bg-canvas">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Legal</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Terms of service</h1>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed flex flex-col gap-6 text-sm">
        <h2 className="text-xl font-sans font-semibold text-ink mt-4">1. Agreement to terms</h2>
        <p className="text-gray-500">
          By accessing or ordering from Maurice Gadgets Hub, you agree to comply with and be bound by these Terms of Service. If you do not agree, you should refrain from using our e-commerce storefront.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">2. Prices and orders</h2>
        <p className="text-gray-500">
          We make every effort to display accurate product details and pricing in Nigerian Naira (NGN). We reserve the right to cancel or adjust orders in the event of pricing typos, technical catalog errors, or unexpected out-of-stock conditions.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">3. Governing law</h2>
        <p className="text-gray-500">
          These terms and conditions are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, and any legal disputes will be resolved exclusively in courts located in Lagos State.
        </p>
      </div>
    </main>
  );
}
