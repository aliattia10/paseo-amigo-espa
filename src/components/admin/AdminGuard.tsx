import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAdminSession } from "@/lib/admin-auth";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protects admin routes: redirects to /admin/login if admin_session cookie is missing.
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAdminSession()) {
      setAllowed(true);
    } else {
      setAllowed(false);
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/admin/login?redirect=${redirect}`, { replace: true });
    }
  }, [navigate, location.pathname, location.search]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-medium-jungle" />
      </div>
    );
  }
  if (!allowed) return null;
  return <>{children}</>;
};

export default AdminGuard;
