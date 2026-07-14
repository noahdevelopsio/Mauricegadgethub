"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

interface PaymentVerifierProps {
  txRef: string;
  orderNumber: string;
}

export default function PaymentVerifier({ txRef, orderNumber }: PaymentVerifierProps) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 8; // 24 seconds total auto-polling

  useEffect(() => {
    if (attempts >= maxAttempts) return;

    const timer = setTimeout(() => {
      setAttempts((a) => a + 1);
      router.refresh(); // Triggers Server Component fetch reload
    }, 3000);

    return () => clearTimeout(timer);
  }, [attempts, router]);

  const handleManualCheck = () => {
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto text-center py-16 px-6 bg-paper rounded-2xl border border-gray-300/40 shadow-card font-sans">
      {attempts < maxAttempts ? (
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-accent mb-4" />
          <h2 className="text-xl font-sans font-semibold text-ink mb-2">Verifying your payment</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            We are confirming your payment status with Flutterwave. This page will update automatically in a few seconds...
          </p>
          <button
            onClick={handleManualCheck}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent border border-gray-300 py-2.5 px-5 rounded-full hover:bg-canvas transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check status manually</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-mustard/15 rounded-full flex items-center justify-center text-mustard border border-mustard/20 mb-4">
            ⏳
          </div>
          <h2 className="text-xl font-sans font-semibold text-ink mb-2">Verification is taking longer than expected</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your payment is currently being processed by the network. You can safely close this window. Once completed, your order status will update and you can track it using your order number.
          </p>
          <div className="text-xs font-bold font-sans uppercase bg-canvas p-3 rounded-xl border border-gray-300/25 mb-6 w-full text-center">
            Order Number: {orderNumber}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href={`/orders/track?order_number=${orderNumber}`}
              className="btn-primary py-3 text-xs font-semibold flex-grow flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Track my order</span>
            </Link>
            <Link
              href="/products"
              className="btn-secondary py-3 text-xs font-semibold flex-grow"
            >
              Back to catalog
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
