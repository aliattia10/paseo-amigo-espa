import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Check, Percent, Calendar, Users, TrendingUp } from 'lucide-react';

interface DiscountCode {
  id: string;
  code: string;
  percentage: number;
  description: string | null;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

const DiscountCodeManager: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const [discountCode, setDiscountCode] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [percentage, setPercentage] = useState(10);
  const [description, setDescription] = useState('');
  const [maxUses, setMaxUses] = useState<number | null>(null);
  const [validUntil, setValidUntil] = useState<string>('');

  useEffect(() => {
    loadDiscountCode();
  }, [currentUser]);

  const loadDiscountCode = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('sitter_id', currentUser.id)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setDiscountCode(data);
    } catch (error) {
      console.error('Error loading discount code:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDiscountCode = async () => {
    if (!currentUser || !userProfile) return;

    if (percentage < 1 || percentage > 100) {
      toast({
        title: 'Invalid percentage',
        description: 'Percentage must be between 1 and 100',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_sitter_discount', {
        p_sitter_id: currentUser.id,
        p_sitter_name: userProfile.name || 'User',
        p_percentage: percentage,
        p_description: description || null,
        p_max_uses: maxUses,
        p_valid_until: validUntil || null,
      });

      if (error) throw error;

      const result = data[0];
      if (result.success) {
        toast({
          title: '🎉 Discount code created!',
          description: `Your code ${result.code} is ready to share`,
        });
        await loadDiscountCode();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating discount code:', error);
      toast({
        title: 'Error',
        description: 'Failed to create discount code',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = () => {
    if (!discountCode) return;
    
    navigator.clipboard.writeText(discountCode.code);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Discount code copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const deactivateCode = async () => {
    if (!discountCode) return;

    try {
      const { error } = await supabase
        .from('discount_codes')
        .update({ is_active: false })
        .eq('id', discountCode.id);

      if (error) throw error;

      toast({
        title: 'Code deactivated',
        description: 'Your discount code has been deactivated',
      });
      
      setDiscountCode(null);
    } catch (error) {
      console.error('Error deactivating code:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate code',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5 text-blue-600" />
          Discount Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {discountCode ? (
          /* Existing Code Display */
          <div className="space-y-4">
            {/* Code Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Discount Code</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                    {discountCode.code}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {discountCode.percentage}% OFF
                </p>
              </div>

              {discountCode.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center mb-4">
                  {discountCode.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs">Uses</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {discountCode.usage_count}
                    {discountCode.max_uses && ` / ${discountCode.max_uses}`}
                  </p>
                </div>

                {discountCode.valid_until && (
                  <div className="bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs">Valid Until</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(discountCode.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button
                onClick={deactivateCode}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Deactivate
              </Button>
            </div>

            {/* Share Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Share your code:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Add it to your profile bio</li>
                <li>• Share in chat with potential clients</li>
                <li>• Post on social media</li>
                <li>• Include in your booking confirmations</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Create New Code Form */
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Attract More Clients
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Create a discount code to offer special deals to pet owners. Your code will be unique and easy to share!
                  </p>
                </div>
              </div>
            </div>

            {/* Percentage */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Discount Percentage *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={percentage}
                  onChange={(e) => setPercentage(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="w-20 text-center">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {percentage}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>5%</span>
                <span>50%</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description (Optional)
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., First-time client special"
                maxLength={100}
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Maximum Uses (Optional)
              </label>
              <Input
                type="number"
                value={maxUses || ''}
                onChange={(e) => setMaxUses(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Unlimited"
                min="1"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for unlimited uses
              </p>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Valid Until (Optional)
              </label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty for no expiration
              </p>
            </div>

            {/* Create Button */}
            <Button
              onClick={createDiscountCode}
              disabled={creating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Percent className="w-4 h-4 mr-2" />
                  Create Discount Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscountCodeManager;
