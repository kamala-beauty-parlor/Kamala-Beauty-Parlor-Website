import React, { useState } from 'react';
import { Star, X, CheckCircle, Heart, Sparkles } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  defaultService = 'Bridal Makeup'
}) => {
  const { addCustomerReview, services } = useSite();
  const { currentUser } = useAuth();

  const [clientName, setClientName] = useState(currentUser?.displayName || '');
  const [serviceName, setServiceName] = useState(defaultService);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !reviewText.trim()) {
      setError('Please provide your name and your review feedback.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await addCustomerReview({
        clientName: clientName.trim(),
        serviceName: serviceName.trim(),
        rating,
        reviewText: reviewText.trim(),
        order: 0
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setReviewText('');
    setError('');
    onClose();
  };

  const ratingDescriptions: Record<number, string> = {
    1: '1/5 - Poor Experience',
    2: '2/5 - Fair, Could Be Better',
    3: '3/5 - Good Service',
    4: '4/5 - Very Good & Satisfied',
    5: '5/5 - Outstanding & Loved It!'
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-pink-200 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-pink-950">
              Thank You for Your Review!
            </h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
              Your kind feedback means the world to Kamala Ma’am and helps other women across Kathmandu find trusted beauty care.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-all cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Customer Feedback</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
                Leave Your Review
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Share your salon experience at Kamala Beauty Parlor, Swayambhu.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Anjali Shrestha"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Service Received
                </label>
                <select
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white text-stone-800"
                >
                  {services && services.length > 0 ? (
                    services.map((s) => (
                      <option key={s.id || s.title} value={s.title}>
                        {s.title} ({s.category})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Bridal Makeup">Bridal Makeup</option>
                      <option value="Party Makeup">Party Makeup</option>
                      <option value="Haircut (women)">Haircut (women)</option>
                      <option value="Hair Spa">Hair Spa</option>
                      <option value="Keratin Treatment">Keratin Treatment</option>
                      <option value="Hydra / Glow Facial">Hydra / Glow Facial</option>
                      <option value="Nail Extension">Nail Extension</option>
                      <option value="Eyebrow Threading">Eyebrow Threading</option>
                    </>
                  )}
                  <option value="Other Beauty Service">Other Beauty Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Your Star Rating *
                </label>
                <div className="flex items-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= (hoverRating || rating);
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-pink-500 hover:scale-110 transition-transform cursor-pointer"
                        title={`${starVal} Star`}
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? 'fill-pink-500 text-pink-500 drop-shadow-xs'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-semibold text-pink-900">
                    {ratingDescriptions[activeRating]}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Your Review & Comments *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us what you loved about your makeup, haircut, or service experience with Kamala Ma’am..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-full border border-pink-200 text-stone-600 hover:bg-pink-50 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
