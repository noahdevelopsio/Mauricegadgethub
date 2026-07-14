export default function WarrantyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto py-20 px-6 md:px-12 bg-canvas">
      <div className="border-b border-gray-300 pb-6 mb-10">
        <span className="text-xs uppercase font-extrabold tracking-widest text-accent font-sans">Legal</span>
        <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink mt-2">Warranty policy</h1>
      </div>

      <div className="font-sans text-gray-700 leading-relaxed flex flex-col gap-6 text-sm">
        <h2 className="text-xl font-sans font-semibold text-ink mt-4">1. Scope of coverage</h2>
        <p className="text-gray-500">
          Maurice Gadgets Hub warrants that all electronic gadgets sold on our platform are free from factory hardware defects under normal usage conditions. This warranty is limited to repair, replacement, or store credit and does not cover physical, liquid, or burn damage.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">2. Warranty durations</h2>
        <p className="text-gray-500">
          - **New Mobile Phones (Apple, Samsung, etc.):** 12-month brand manufacturer warranty.<br />
          - **PlayStation Consoles:** 12-month manufacturer warranty.<br />
          - **Audio Accessories (Earpods, Speakers):** 6-month store warranty.<br />
          - **Charging Blocks, Cables, and Power Banks:** 3-month store warranty.
        </p>

        <h2 className="text-xl font-sans font-semibold text-ink mt-4">3. Exclusion criteria</h2>
        <p className="text-gray-500">
          The following instances invalidate the warranty coverage immediately:
          - Devices showing signs of dropping, heavy impact, or structural cracking.<br />
          - Water entry or exposure to moisture (even on water-resistant models).<br />
          - Software modification (rooting, jailbreaking, custom firmware loads).<br />
          - Repairs attempted by unauthorized personnel or non-official repair hubs.
        </p>
      </div>
    </main>
  );
}
