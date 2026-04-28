import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { emitBookingWorkflowEvent } from '@/lib/booking-workflow';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  revieweeId: string;
  revieweeName: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  revieweeId,
  revieweeName,
  onReviewSubmitted
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(t('review.selectRating', 'Please select a rating'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await (supabase as any)
        .rpc('create_review', {
          p_booking_id: bookingId,
          p_reviewee_id: revieweeId,
          p_rating: rating,
          p_comment: comment || null
        });

      if (rpcError) throw rpcError;

      if (!data?.success) {
        throw new Error(data?.error || t('review.submitFailed', 'Failed to submit review'));
      }

      // Add a timeline message in chat so both users can continue naturally
      // while still seeing that a review was left.
      try {
        const { data: bookingRow } = await supabase
          .from('bookings')
          .select('id, owner_id, sitter_id')
          .eq('id', bookingId)
          .single();

        if (bookingRow?.owner_id && bookingRow?.sitter_id && currentUser?.id) {
          await emitBookingWorkflowEvent({
            bookingId,
            ownerId: bookingRow.owner_id,
            sitterId: bookingRow.sitter_id,
            actorId: currentUser.id,
            chatMessage: `Review submitted: ${rating}★${comment ? ` - "${comment}"` : ''}`,
          });
        }
      } catch {
        // Non-blocking: review is already saved, chat event is best-effort.
      }

      toast({
        title: t('review.submitted', 'Review Submitted!'),
        description: t('review.paymentReleased', 'Thank you! Payment has been released to the sitter\'s balance.'),
      });

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
      
      setRating(0);
      setComment('');
      onClose();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || t('review.submitFailed', 'Failed to submit review'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t('review.leaveReview', 'Leave a Review')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          {t('review.howWasExperience', 'How was your experience with {{name}}?', { name: revieweeName })}
        </p>
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
          {t('review.paymentNote', 'After submitting your review, the payment will be automatically released to the sitter\'s balance.')}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('review.rating', 'Rating')}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={36}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t('review.commentOptional', 'Comment (Optional)')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('review.sharePlaceholder', 'Share your experience...')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent resize-none placeholder:text-gray-400"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {comment.length}/500
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? t('common.loading', 'Submitting...') : t('review.submit', 'Submit Review')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
