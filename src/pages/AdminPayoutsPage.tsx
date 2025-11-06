import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

// This is a simple admin page to process payout requests
// In production, you would add proper admin authentication

const AdminPayoutsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPayoutRequests();
  }, []);

  const loadPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('payout_requests')
        .select(`
          *,
          sitter:users!payout_requests_sitter_id_fkey(
            id,
            name,
            email,
            payout_method,
            paypal_email,
            bank_name,
            iban,
            account_holder_name
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error: any) {
      console.error('Error loading payout requests:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsProcessed = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: 'Payout marked as processed',
      });

      // Reload requests
      await loadPayoutRequests();
    } catch (error: any) {
      console.error('Error processing payout:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Payout Requests</h1>
        <Button onClick={() => navigate('/profile')} variant="outline">
          Back to Profile
        </Button>
      </div>

      {payoutRequests.length === 0 ? (
        <div className="text-center py-12 bg-card-light dark:bg-card-dark rounded-xl">
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            No pending payout requests
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {payoutRequests.map((request) => (
            <div
              key={request.id}
              className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">
                    {request.sitter?.name || 'Unknown Sitter'}
                  </h3>
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {request.sitter?.email}
                  </p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    ${request.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                    Requested: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payout Details:</h4>
                  {request.payout_method === 'paypal' ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">PayPal</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {request.sitter?.paypal_email}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">Bank Transfer</p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>Account Holder:</strong> {request.sitter?.account_holder_name}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>IBAN:</strong> {request.sitter?.iban}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>Bank:</strong> {request.sitter?.bank_name}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleMarkAsProcessed(request.id)}
                    disabled={processing === request.id}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {processing === request.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Mark as Processed'
                    )}
                  </Button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  <strong>Action Required:</strong> Process this payout manually via{' '}
                  {request.payout_method === 'paypal' ? 'PayPal' : 'bank transfer'}, then mark as
                  processed.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;
