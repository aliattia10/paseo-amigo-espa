import React from "react";
import { ArrowLeft, MessageCircle, Search, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const steps = [
  {
    icon: Search,
    title: "Discover",
    text: "Pet owners browse nearby sitter profiles with photos, ratings, and availability.",
  },
  {
    icon: MessageCircle,
    title: "Match and Chat",
    text: "Users connect, clarify details, and agree on timing directly in app messaging.",
  },
  {
    icon: ShieldCheck,
    title: "Book Securely",
    text: "Bookings and payments are processed with platform safeguards and support channels.",
  },
];

const HowItWorksPage: React.FC = () => {
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

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">How It Works</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
          A simple Tinder-style flow for discovering, matching, and booking trusted pet care.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
              <step.icon className="w-6 h-6 text-medium-jungle mb-3" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
