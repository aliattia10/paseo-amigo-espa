import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginAdmin } from "@/lib/admin-auth";
import { Lock, Loader2 } from "lucide-react";

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const redirectTo = searchParams.get("redirect") || "/admin/verifications";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = loginAdmin(password);
    setLoading(false);
    if (ok) {
      toast({ title: "Welcome", description: "Admin access granted." });
      navigate(redirectTo, { replace: true });
    } else {
      toast({ title: "Invalid password", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-6 w-6 text-medium-jungle" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="mt-1"
              disabled={loading}
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full bg-medium-jungle hover:bg-medium-jungle/90" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
