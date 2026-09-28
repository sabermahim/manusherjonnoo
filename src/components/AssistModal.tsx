import React, { useState } from 'react';
import { Check, Heart, Loader2, Sparkles, X } from 'lucide-react';
import { api } from '../lib/api.ts';
import { HelpRequest } from '../types/index.ts';

interface AssistModalProps {
  request: HelpRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ASSIST_OPTIONS = [
  { id: 'প্রয়োজনীয় জিনিস কিনে দিতে চাই', label: 'প্রয়োজনীয় জিনিস কিনে দিতে চাই', desc: 'পোশাক, কম্বল, ছাতা বা প্রয়োজনীয় সামগ্রী' },
  { id: 'খাবার দিতে চাই', label: 'খাবার দিতে চাই', desc: 'রান্না করা খাবার অথবা শুকনো চাল-ডাল-তেল' },
  { id: 'শিক্ষা সামগ্রী দিতে চাই', label: 'শিক্ষা সামগ্রী দিতে চাই', desc: 'বই, খাতা, কলম বা স্কুল ফি সহায়তা' },
  { id: 'চিকিৎসা সহায়তা করতে চাই', label: 'চিকিৎসা সহায়তা করতে চাই', desc: 'ঔষধ ক্রয় বা প্রাথমিক চিকিৎসার খরচ' },
  { id: 'সরাসরি গিয়ে সাহায্য করতে চাই', label: 'সরাসরি গিয়ে সাহায্য করতে চাই', desc: 'মাঠপর্যায়ে উপস্থিত হয়ে সরাসরি দায়িত্ব পালন' },
  { id: 'অন্যান্য', label: 'অন্যান্য সহায়তা', desc: 'অন্য কোনো উপায়ে প্রয়োজনীয় সেবা প্রদান' },
];

export const AssistModal: React.FC<AssistModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState(ASSIST_OPTIONS[0].id);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.assistPledge(request.id, {
        assistanceType: selectedType,
        message: message.trim() || 'আমি এই প্রয়োজনে অংশ নিতে আন্তরিকভাবে আগ্রহী।',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'সহায়তা নিশ্চিত করতে ত্রুটি হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-bengali">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <Heart className="w-6 h-6 fill-current text-emerald-600" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 mb-1 border border-emerald-200">
              সাহায্যের সুযোগ (Help Opportunity)
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              আমি সাহায্য করব
            </h3>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-5">
          <p className="text-xs text-slate-500 font-medium">আবেদন শিরোনাম:</p>
          <p className="text-sm font-bold text-slate-800 line-clamp-1">{request.title}</p>
          <p className="text-xs text-slate-600 mt-1">
            এলাকা: <span className="font-semibold text-slate-800">{request.locationName}</span> | বিভাগ: {request.category}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2">
              আপনি কীভাবে সাহায্য করতে চান?
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {ASSIST_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => setSelectedType(opt.id)}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="assistanceType"
                      checked={isSelected}
                      onChange={() => setSelectedType(opt.id)}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              সমন্বয় বার্তা বা মন্তব্য (ঐচ্ছিক)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder=""
              rows={3}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

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
              disabled={loading}
              className="flex-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>সাহায্য নিশ্চিত করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
