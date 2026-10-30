import React, { useState } from 'react';
import { Send, X, CheckCircle, MessageSquare, Phone } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose }) => {
  const { sendCustomerMessage, settings } = useSite();
  const { currentUser, userProfile } = useAuth();

  const [name, setName] = useState(userProfile?.fullName || currentUser?.displayName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Please provide your name and your inquiry message.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await sendCustomerMessage({
        name: name.trim(),
        phone: phone.trim() || '',
        email: email.trim() || '',
        message: message.trim(),
        read: false,
        createdAt: new Date().toISOString()
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. You can also reach us via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setMessage('');
    setError('');
    onClose();
  };

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

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-pink-950">
              Message Sent to Kamala Ma’am!
            </h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
              Thank you for contacting Kamala Beauty Parlor. We have received your inquiry and will respond promptly via call or WhatsApp.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition cursor-pointer"
              >
                Done
              </button>
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 font-bold px-5 py-2.5 rounded-full text-xs transition inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-pink-600 text-xs font-bold uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Direct Inquiry</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Ask about bridal packages, prices, or parlor appointments in Swayambhu.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {currentUser ? (
                <div className="bg-pink-50 p-3 rounded-2xl border border-pink-200 text-xs text-pink-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Signed in as:</span> {name || currentUser.displayName || currentUser.email}
                    {currentUser.email && (
                      <span className="text-stone-500 block text-[11px]">{currentUser.email}</span>
                    )}
                  </div>
                  <span className="bg-white border border-pink-200 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Auto-Filled
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kamala KC"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9841XXXXXX"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Your Message or Question *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your question about haircuts, facial timing, bridal party reservations..."
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
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
