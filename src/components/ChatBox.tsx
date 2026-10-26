import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Phone, 
  Check, 
  User as UserIcon, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

interface ChatMessage {
  id: string;
  sender: 'client' | 'kamala';
  text: string;
  time: string;
}

interface ChatBoxProps {
  currentTab?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ currentTab }) => {
  const { currentUser, userProfile } = useAuth();
  const { sendCustomerMessage, settings } = useSite();

  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState(() => {
    return sessionStorage.getItem('kamala_guest_name') || '';
  });
  const [guestPhone, setGuestPhone] = useState(() => {
    return sessionStorage.getItem('kamala_guest_phone') || '';
  });
  const [hasEnteredGuestInfo, setHasEnteredGuestInfo] = useState(() => {
    return !!(sessionStorage.getItem('kamala_guest_name') && sessionStorage.getItem('kamala_guest_phone'));
  });

  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Stored chat messages
  const [messagesList, setMessagesList] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kamala_live_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-1',
        sender: 'kamala',
        text: 'Namaste! 🙏 Welcome to Kamala Beauty Parlor in Swayambhu, Kathmandu. How may I assist you with bridal makeup, hair care, skin glow facials, or beauty courses today?',
        time: 'Just now'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setUnreadCount(0);
    }
  }, [isOpen, messagesList]);

  // Persist messages in local storage
  useEffect(() => {
    try {
      localStorage.setItem('kamala_live_chat_history', JSON.stringify(messagesList));
    } catch (e) {
      console.warn('Failed to save chat history:', e);
    }
  }, [messagesList]);

  // Listen for open chat event from anywhere in the app
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open_kamala_chat', handleOpenChat);
    return () => window.removeEventListener('open_kamala_chat', handleOpenChat);
  }, []);

  // When admin page is opened, the customer chat box widget is hidden
  if (currentTab === 'admin' || (typeof window !== 'undefined' && window.location.hash === '#admin')) {
    return null;
  }

  const isUserAuthenticated = !!currentUser;
  const clientName = isUserAuthenticated
    ? userProfile?.fullName || currentUser.displayName || currentUser.email?.split('@')[0] || 'Valued Customer'
    : guestName.trim();
  const clientPhone = isUserAuthenticated
    ? userProfile?.phone || ''
    : guestPhone.trim();
  const clientEmail = isUserAuthenticated ? currentUser.email || '' : '';

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      return;
    }
    sessionStorage.setItem('kamala_guest_name', guestName.trim());
    sessionStorage.setItem('kamala_guest_phone', guestPhone.trim());
    setHasEnteredGuestInfo(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isSubmitting) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `client-${Date.now()}`,
      sender: 'client',
      text: messageContent,
      time: timeStr
    };

    setMessagesList((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);

    // Save message to Firestore & SiteContext
    try {
      await sendCustomerMessage({
        userId: currentUser?.uid,
        name: clientName || 'Guest User',
        phone: clientPhone || '',
        email: clientEmail || '',
        message: messageContent,
        read: false,
        sender: 'client',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error sending chat message:', err);
    }

    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    '💄 Bridal Makeup Package & Pricing',
    '💇 Hair Smoothening / Keratin Cost',
    '✨ Facial & Bleach Rates',
    '📚 Beautician Training Classes'
  ];

  const waPhoneClean = settings.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${waPhoneClean}?text=${encodeURIComponent(
    `Namaste Kamala Beauty Parlor! I am chatting from the website (${clientName || 'Customer'}). I would like to inquire about your services.`
  )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Toggle Button (When Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open chat box with Kamala"
            className="group relative flex items-center gap-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <div className="relative">
              <MessageSquare className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
              <span className="text-xs font-bold font-sans">Chat with Kamala</span>
              <span className="text-[10px] text-pink-100 font-normal">Swayambhu Parlor</span>
            </div>
          </button>
      )}

      {/* Floating Chat Box Window (When Open) */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[390px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-pink-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-inner">
                  <img
                    src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                    alt="Kamala"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
              </div>
              <div>
                <h3 className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Kamala Beauty Parlor</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </h3>
                <p className="text-[11px] text-pink-100 flex items-center gap-1">
                  <span>Online • Swayambhu, Kathmandu</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Continue on WhatsApp"
                className="text-pink-100 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={() => setIsOpen(false)}
                className="text-pink-100 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition cursor-pointer"
                aria-label="Close chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="bg-pink-50/80 px-4 py-1.5 border-b border-pink-100 flex items-center justify-between text-[11px]">
            {isUserAuthenticated ? (
              <span className="text-pink-900 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Signed in as <strong className="font-semibold">{clientName}</strong>
              </span>
            ) : hasEnteredGuestInfo ? (
              <span className="text-pink-900 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Chatting as <strong className="font-semibold">{clientName}</strong> ({clientPhone})
              </span>
            ) : (
              <span className="text-stone-500">Guest Visitor</span>
            )}

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-700 hover:text-pink-900 font-bold flex items-center gap-0.5 text-[10px]"
            >
              <span>WhatsApp</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF8F6]">
            {messagesList.map((m) => {
              const isKamala = m.sender === 'kamala';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isKamala ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {isKamala && (
                      <div className="w-6 h-6 rounded-full bg-pink-100 p-0.5 flex-shrink-0 mb-1 border border-pink-200">
                        <img
                          src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
                          alt="Kamala"
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isKamala
                          ? 'bg-white text-stone-800 border border-pink-100 rounded-bl-xs'
                          : 'bg-gradient-to-r from-pink-600 to-rose-500 text-white rounded-br-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              );
            })}

            {/* Quick Inquiry Buttons (shown early in conversation) */}
            {messagesList.length <= 3 && (
              <div className="pt-2">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold mb-1.5 px-1">
                  Frequent Inquiries:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (isUserAuthenticated || hasEnteredGuestInfo) {
                          handleSendMessage(q);
                        } else {
                          setInputText(q);
                        }
                      }}
                      className="bg-white hover:bg-pink-50 text-pink-900 border border-pink-200 hover:border-pink-400 rounded-full px-2.5 py-1 text-[11px] font-medium transition cursor-pointer text-left shadow-xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-pink-100">
            {/* If NOT signed in and hasn't given name + phone yet: Require them */}
            {!isUserAuthenticated && !hasEnteredGuestInfo ? (
              <form onSubmit={handleStartGuestChat} className="space-y-2.5 bg-pink-50/50 p-3 rounded-2xl border border-pink-200">
                <div className="text-left">
                  <p className="text-xs font-bold text-pink-950">
                    Introduce Yourself to Chat
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Please provide your name & phone number so Kamala Ma’am can reach you.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="Phone / WhatsApp Number *"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Start Chatting with Kamala</span>
                </button>
              </form>
            ) : (
              /* Signed In or Guest Verified: Instant direct message input */
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Type message as ${clientName}...`}
                  className="flex-1 bg-stone-50 focus:bg-white border border-pink-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-400 transition"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSubmitting}
                  className="bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white p-2.5 rounded-full shadow-xs transition disabled:opacity-40 cursor-pointer active:scale-95 flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
