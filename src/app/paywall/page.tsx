"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserPlanStore } from "@/store/user-plan.store";
import toast from "react-hot-toast";

export default function Paywall() {
  const router = useRouter();
  const plan = useUserPlanStore((state) => state.plan);
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpgrade() {
    setIsLoading(true);
    toast.success("Payment integration coming next");
    setIsLoading(false);
  }

  if (plan === "pro") {
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
        <h2 className="text-2xl font-semibold mb-2">
          Upgrade to access Stak
        </h2>

        <p className="text-gray-600 mb-6">
          You&apos;re currently on a free account. Upgrade to unlock full access.
        </p>

        <div className="text-left mb-6 space-y-2">
          <p>✔ Unlimited content generation</p>
          <p>✔ Multi-platform exports (Twitter, LinkedIn, Blogs)</p>
          <p>✔ Faster processing</p>
        </div>

        <div className="text-2xl font-bold mb-6">
          $12/month
        </div>

        <button
          onClick={() => {
            window.location.href = "https://checkout.dodopayments.com/buy/pdt_0NdejxwmeNMSaig2J5F8L?quantity=1";
          }}
          className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}