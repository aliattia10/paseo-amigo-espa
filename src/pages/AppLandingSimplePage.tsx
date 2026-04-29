import React from "react";
import { Heart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AppLandingSimplePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-900 dark:to-gray-950 px-5 py-8">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <img src="/app-logo.png?v=2" alt="Paseo" className="w-16 h-16 mx-auto mb-3 rounded-full" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Paseo</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Swipe. Match. Walk.
          </p>
        </div>

        <div className="rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
          <img
            src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=800"
            alt="Dog profile card"
            className="w-full h-72 object-cover"
          />
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Trusted local walkers</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Find verified sitters near you in a simple swipe flow.
            </p>
            <div className="flex justify-center gap-8 mt-5">
              <button className="h-12 w-12 rounded-full bg-red-50 text-red-500 grid place-items-center" aria-label="Pass">
                <X />
              </button>
              <button className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center" aria-label="Like">
                <Heart />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button className="w-full bg-medium-jungle hover:bg-medium-jungle/90 text-white" onClick={() => navigate("/auth?mode=signup")}>
            Create Account
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppLandingSimplePage;
