import React from "react";
import { ArrowLeft, Briefcase, Heart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CareersPage: React.FC = () => {
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

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Careers at Paseo</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Help us build trusted pet care experiences for owners and walkers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <div className="rounded-2xl p-6 bg-ash-grey/10 text-center">
            <Briefcase className="mx-auto mb-3 text-medium-jungle" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Mission-Driven</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Work on meaningful trust, safety, and mobility challenges.
            </p>
          </div>
          <div className="rounded-2xl p-6 bg-ash-grey/10 text-center">
            <Heart className="mx-auto mb-3 text-medium-jungle" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Pet-First Culture</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Build product decisions around pet wellbeing and owner confidence.
            </p>
          </div>
          <div className="rounded-2xl p-6 bg-ash-grey/10 text-center">
            <Users className="mx-auto mb-3 text-medium-jungle" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Small Team Impact</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Own features end-to-end with fast feedback loops.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Open Applications</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We are currently accepting open applications for product, engineering, operations, and support roles.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Send your profile and a short intro to{" "}
            <a className="text-medium-jungle underline" href="mailto:info@petflik.com">
              info@petflik.com
            </a>.
          </p>
          <Button onClick={() => navigate("/contact")} className="bg-medium-jungle hover:bg-medium-jungle/90 text-white">
            Contact Hiring Team
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
