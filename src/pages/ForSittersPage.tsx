import React from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ForSittersPage: React.FC = () => {
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

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">For Sitters and Walkers</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          Offer dog walking and pet care services with flexible scheduling and secure payouts.
        </p>

        <div className="space-y-4 mb-10">
          {[
            "Create your profile and availability",
            "Receive matches from nearby pet owners",
            "Manage bookings and communication in-app",
            "Get paid through secure Stripe-connected flows",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 text-medium-jungle w-5 h-5" />
              <p className="text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/auth?mode=signup")} className="bg-medium-jungle hover:bg-medium-jungle/90 text-white">
            Become a Sitter
          </Button>
          <Button variant="outline" onClick={() => navigate("/how-it-works")}>
            See How It Works
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForSittersPage;
