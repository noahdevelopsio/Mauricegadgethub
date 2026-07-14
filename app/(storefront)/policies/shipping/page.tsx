export default function ShippingPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12 bg-canvas">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Legal</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Shipping & returns</h1>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed flex flex-col gap-6 text-sm">
        <h2 className="text-xl font-sans font-semibold text-ink mt-4">1. Delivery coverage</h2>
        <p className="text-gray-500">
          We offer delivery services within Lagos via our store-managed riders and across all major states in Nigeria via verified third-party courier services (e.g. GIG Logistics). Shipping rates are flat-fee within Lagos and variable based on courier calculations for other regions.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">2. Delivery timeframes</h2>
        <p className="text-gray-500">
          - **Lagos (Express):** 24 to 48 business hours after order placement.<br />
          - **Lagos (Same-Day):** Eligible for orders placed before 10:00 AM on weekdays (surcharge applies).<br />
          - **Other States:** 3 to 5 business days depending on the courier hub.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">3. In-store pickup</h2>
        <p className="text-gray-500">
          Customers can select the "In-Store Pickup" option at checkout to collect their items in person at our showroom in Ikeja Computer Village, Lagos. Pickup hours are Monday through Saturday, between 10:00 AM and 5:00 PM. No pickup fee is charged.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">4. Returns and exchanges</h2>
        <p className="text-gray-500">
          We accept returns or exchanges under the following conditions:
          - The product is returned within 7 days from the delivery date.<br />
          - The product remains factory-sealed, unused, and in its original retail packaging.<br />
          - Software, game discs, and open-box accessories are not eligible for returns unless they are confirmed dead on arrival.
        </p>
      </div>
    </main>
  );
}
