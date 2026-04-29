import React from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-medium-jungle transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Pricing</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          Transparent service and platform fee structure shown before booking confirmation.
        </p>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What You Pay For</h2>
          <div className="space-y-3">
            {[
              "Sitter/walker service amount",
              "Platform service fee shown at checkout",
              "Secure payment processing",
              "In-app support and dispute handling",
            ].map((line) => (
              <div key={line} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-medium-jungle" />
                <span className="text-gray-700 dark:text-gray-300">{line}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/auth?mode=signup")} className="bg-medium-jungle hover:bg-medium-jungle/90 text-white">
            Start Booking
          </Button>
          <Button variant="outline" onClick={() => navigate("/refund-policy")}>
            Read Refund Policy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
