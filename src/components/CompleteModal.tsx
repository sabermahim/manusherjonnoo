import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '../lib/api.ts';
import { HelpRequest } from '../types/index.ts';

interface CompleteModalProps {
  request: HelpRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompleteModal: React.FC<CompleteModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) {
      setError('অনুগ্রহ করে নিশ্চিতকরণ চেকবক্সে টিক দিন।');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.markCompleted(request.id, notes.trim() || 'সহায়তা সফলভাবে সম্পন্ন করা হয়েছে।', true);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'সম্পন্ন চিহ্নিত করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-bengali">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
          সহায়তা সম্পন্ন নিশ্চিতকরণ
        </h3>

        <p className="text-xs sm:text-sm text-center text-slate-600 mb-6">
          আপনি কি নিশ্চিত যে <span className="font-bold text-slate-800">"{request.title}"</span>-এর
          সহায়তা কার্যক্রম সফলভাবে প্রদান করা হয়েছে?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সম্পন্ন সংক্রান্ত মন্তব্য বা ফলাফল (ঐচ্ছিক)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="কীভাবে সহায়তাটি সম্পন্ন হলো, তা সংক্ষেপে উল্লেখ করতে পারেন..."
              rows={3}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
            />
            <span className="text-xs text-emerald-950 font-semibold leading-relaxed">
              হ্যাঁ, আমি নিশ্চিত করছি যে সহায়তাটি সঠিকভাবে পৌঁছে দেওয়া হয়েছে এবং কার্যক্রমটি সফল হয়েছে।
            </span>
          </label>

          {error && (
            <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={loading || !confirmed}
              className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আপডেট হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>সম্পন্ন নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
