import React, { useState } from 'react';
import { Calendar, HelpCircle, Loader2, MapPin, Send, Users, X } from 'lucide-react';
import { api } from '../lib/api.ts';
import { HelpRequest } from '../types/index.ts';

interface VolunteerAppealModalProps {
  request: HelpRequest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VolunteerAppealModal: React.FC<VolunteerAppealModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [helpType, setHelpType] = useState('মাঠপর্যায়ে সরাসরি সহায়তা');
  const [volunteerCount, setVolunteerCount] = useState(1);
  const [timeNeeded, setTimeNeeded] = useState('তাৎক্ষণিক / সুবিধাজনক সময়ে');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.requestVolunteerAppeal(request.id, {
        helpType,
        volunteerCount,
        timeNeeded,
        message: message.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'আহ্বান জানাতে ত্রুটি হয়েছে।');
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
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 mb-1 border border-teal-200">
              স্বেচ্ছাসেবক নেটওয়ার্ক
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              স্বেচ্ছাসেবক প্রয়োজন
            </h3>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-xs text-slate-600">
          <p className="font-bold text-slate-800 line-clamp-1">{request.title}</p>
          <p className="mt-1 flex items-center gap-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>স্থান: {request.locationName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              কী ধরনের সহায়তা প্রয়োজন?
            </label>
            <select
              value={helpType}
              onChange={(e) => setHelpType(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
            >
              <option value="মাঠপর্যায়ে সরাসরি সহায়তা">মাঠপর্যায়ে সরাসরি সহায়তা</option>
              <option value="খাবার বা ত্রাণ বিতরণ">খাবার বা প্রয়োজনীয় সামগ্রী বিতরণ</option>
              <option value="চিকিৎসা বা হাসপাতালে নিয়ে যাওয়া">চিকিৎসা বা হাসপাতালে সাহায্য</option>
              <option value="শিক্ষা সহায়তায় পথশিশুদের পড়ানো">শিক্ষা সহায়তায় পাঠদান</option>
              <option value="পরামর্শ বা মানসিক সংহতি">পরামর্শ বা কাউন্সেলিং</option>
              <option value="সাধারণ দায়িত্ব পালন">অন্যান্য সাধারণ দায়িত্ব</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কতজন প্রয়োজন?
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={volunteerCount}
                onChange={(e) => setVolunteerCount(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কখন সহায়তা প্রয়োজন?
              </label>
              <input
                type="text"
                value={timeNeeded}
                onChange={(e) => setTimeNeeded(e.target.value)}
                placeholder=""
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              স্বেচ্ছাসেবকদের জন্য বার্তা বা নির্দেশনা (ঐচ্ছিক)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder=""
              rows={3}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
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
              className="flex-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>আহ্বান পাঠানো হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>আহ্বান পাঠান</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
