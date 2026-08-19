import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, X, ChevronRight, Check } from 'lucide-react';
import { Button } from './Button';
import { RoutePath } from '../../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToNotes = () => {
    onClose();
    navigate(RoutePath.NOTES);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/80 bg-white/70 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_30px_90px_-15px_rgba(50,60,100,0.25)] ring-1 ring-white/60">
        
        {/* Glow Highlights */}
        <div className="absolute top-[-20%] left-[-10%] w-[250px] h-[250px] bg-indigo-400/20 blur-[70px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[250px] h-[250px] bg-purple-400/20 blur-[70px] rounded-full pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors z-20"
        >
          <X size={18} />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          {/* Header Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-white/60">
            <Zap size={30} fill="currentColor" className="opacity-90" />
          </div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Plan Limit Reached
          </h3>

          <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed mb-6">
            Free plan limit reached. Upgrade to Pro to create unlimited notes.
          </p>

          <div className="w-full bg-white/60 rounded-2xl border border-white/80 p-4 mb-6 text-left space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Create unlimited notes & documents</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Unlimited storage for file attachments</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <div className="h-4 w-4 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Check size={10} strokeWidth={3} />
              </div>
              <span>Advanced AI summarization & tools</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <Button 
              variant="primary" 
              size="lg" 
              className="w-full h-12 rounded-full shadow-lg shadow-indigo-500/25 group"
              onClick={() => alert("Pro subscriptions are coming soon! Thank you for testing.")}
            >
              <Sparkles size={16} className="mr-2 group-hover:rotate-12 transition-transform" />
              <span>Upgrade to Pro</span>
              <ChevronRight size={16} className="ml-1 opacity-60" />
            </Button>

            <button 
              onClick={handleGoToNotes}
              className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              View My Notes
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
