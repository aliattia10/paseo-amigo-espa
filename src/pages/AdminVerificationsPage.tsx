import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { approveUser, rejectUser } from '@/lib/kyc-actions';
import { Loader2, CheckCircle, XCircle, ArrowLeft, LogOut } from 'lucide-react';
import { clearAdminSession } from '@/lib/admin-auth';
import { useTranslation } from 'react-i18next';

interface UserRow {
  id: string;
  email: string | null;
  name: string | null;
  verification_status: string | null;
  kyc_confidence: number | null;
  kyc_data: Record<string, unknown> | null;
  verified: boolean;
  updated_at: string | null;
}

const AdminVerificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    loadUsers();
  }, [isAdmin, authLoading, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, verification_status, kyc_confidence, kyc_data, verified, updated_at')
        .not('verification_status', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setUsers((data as UserRow[]) || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: t('common.error'), description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const setVerification = async (userId: string, status: 'verified' | 'rejected') => {
    setUpdatingId(userId);
    try {
      if (status === 'verified') await approveUser(userId);
      else await rejectUser(userId);
      toast({
        title: t('common.success'),
        description: status === 'verified' ? 'User approved.' : 'User rejected.',
      });
      await loadUsers();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast({ title: t('common.error'), description: msg, variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-medium-jungle" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {t('admin.verifications', 'KYC Verifications')}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { clearAdminSession(); navigate('/admin/login'); }}
            className="text-gray-600 dark:text-gray-400"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Log out
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-medium-jungle" />
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">AI Confidence</th>
                    <th className="px-4 py-3">Doc Type</th>
                    <th className="px-4 py-3">Scanned Name</th>
                    <th className="px-4 py-3">Last Updated</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3">{u.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.verification_status === 'verified'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : u.verification_status === 'rejected'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {u.verification_status ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.kyc_confidence != null
                          ? (Number(u.kyc_confidence) * 100).toFixed(1) + '%'
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(u.kyc_data as { doc_type?: string })?.doc_type ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {(u.kyc_data as { extracted_data?: { name?: string } })?.extracted_data?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {u.updated_at
                          ? new Date(u.updated_at).toLocaleString()
                          : '—'}
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updatingId === u.id || u.verification_status === 'verified'}
                          onClick={() => setVerification(u.id, 'verified')}
                        >
                          {updatingId === u.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={updatingId === u.id || u.verification_status === 'rejected'}
                          onClick={() => setVerification(u.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationsPage;
