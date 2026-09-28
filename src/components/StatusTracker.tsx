import React from 'react';
import { Check, Clock, AlertTriangle, XCircle, HeartHandshake, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { RequestStatus } from '../types/index.ts';

interface StatusTrackerProps {
  currentStatus: RequestStatus;
  isVerified?: boolean;
}

const STAGES: { key: RequestStatus; label: string; icon: string }[] = [
  { key: 'অপেক্ষমাণ', label: 'আবেদন জমা', icon: 'Clock' },
  { key: 'যাচাই হচ্ছে', label: 'যাচাই হচ্ছে', icon: 'ShieldCheck' },
  { key: 'অনুমোদিত', label: 'অনুমোদিত', icon: 'Check' },
  { key: 'সাহায্য প্রয়োজন', label: 'সাহায্য প্রয়োজন', icon: 'HeartHandshake' },
  { key: 'সাহায্যকারী পাওয়া গেছে', label: 'সাহায্যকারী পাওয়া গেছে', icon: 'HeartHandshake' },
  { key: 'সহায়তা চলছে', label: 'সহায়তা চলছে', icon: 'Clock' },
  { key: 'সম্পন্ন', label: 'সম্পন্ন', icon: 'CheckCircle2' },
];

export const StatusTracker: React.FC<StatusTrackerProps> = ({ currentStatus, isVerified }) => {
  if (currentStatus === 'বাতিল') {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 font-bengali">
        <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
        <div>
          <p className="text-sm font-bold">আবেদনটি বাতিল করা হয়েছে</p>
          <p className="text-xs text-rose-600 mt-0.5">এই সহায়তা সুযোগটি বর্তমানে সক্রিয় নয়।</p>
        </div>
      </div>
    );
  }

  // Find index of current status
  let currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
  if (currentIndex === -1) {
    if (currentStatus === 'অনুমোদিত') currentIndex = 2;
    else currentIndex = 0;
  }

  return (
    <div className="font-bengali bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          কার্যক্রম অগ্রগতি ট্র্যাকার (Progress Timeline)
        </span>
        <div className="flex items-center gap-2">
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> যাচাইকৃত
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            বর্তমান: {currentStatus}
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative mt-2">
        <div className="hidden sm:block absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{
              width: `${(currentIndex / (STAGES.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-1 relative z-10">
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div key={stage.key} className="flex sm:flex-col items-center gap-2 sm:gap-1 text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] leading-tight text-left sm:text-center ${
                    isCurrent
                      ? 'font-bold text-emerald-800'
                      : isCompleted
                      ? 'font-medium text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
