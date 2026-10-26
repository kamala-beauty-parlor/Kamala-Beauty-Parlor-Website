import React from 'react';
import { Sparkles, Home, Calendar } from 'lucide-react';

interface NotFoundProps {
  setCurrentTab: (tab: string) => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-md mx-auto my-20 px-4 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#FCEFF2] text-[#8A2E44] flex items-center justify-center mx-auto shadow-inner">
        <Sparkles className="w-8 h-8 text-[#C59B27]" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-5xl font-bold text-stone-900">404</h1>
        <h2 className="font-serif text-2xl font-bold text-[#8A2E44]">Page Not Found</h2>
        <p className="text-xs sm:text-sm text-stone-600">
          The beauty treatment or page you are looking for does not exist or has been relocated.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={() => {
            setCurrentTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto bg-[#8A2E44] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('booking');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-full sm:w-auto border border-[#8A2E44] text-[#8A2E44] px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#F7EBEF]"
        >
          <Calendar className="w-4 h-4 text-[#C59B27]" />
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  );
};
