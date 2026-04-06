import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Legacy route: Didit callback now targets `/verify-identity` directly.
 * Keeps old bookmarks and any hardcoded `/verify-identity-done` links working.
 */
const VerifyIdentityDonePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    navigate(q ? `/verify-identity?${q}` : '/verify-identity', { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-ash-grey/20 via-white to-muted-olive/20">
      <Loader2 className="w-8 h-8 animate-spin text-medium-jungle mb-2" />
      <p className="text-sm text-gray-600">Redirecting…</p>
    </div>
  );
};

export default VerifyIdentityDonePage;
