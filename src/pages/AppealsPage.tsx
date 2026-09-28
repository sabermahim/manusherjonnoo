import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { VolunteerAppeal } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AppealsPageProps {
  onSelectRequest: (id: number) => void;
  onOpenVolunteerRegister: () => void;
  onOpenLogin: () => void;
}

export const AppealsPage: React.FC<AppealsPageProps> = ({
  onSelectRequest,
  onOpenVolunteerRegister,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [appeals, setAppeals] = useState<VolunteerAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [joinedSuccessMessage, setJoinedSuccessMessage] = useState('');

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const data = await api.getAppeals();
      setAppeals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleJoinVolunteer = async (reqId: number) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    try {
      await api.joinVolunteer(reqId);
      setJoinedSuccessMessage('আপনি সফলভাবে এই মানবিক কার্যক্রমে যুক্ত হয়েছেন!');
      fetchAppeals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDismiss = (appealId: number) => {
    setDismissedIds((prev) => [...prev, appealId]);
  };

  const visibleAppeals = appeals.filter((a) => !dismissedIds.includes(a.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-bengali space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>স্বেচ্ছাসেবক নেটওয়ার্ক ও দ্রুত সহায়তা</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            স্বেচ্ছাসেবক আহ্বান (Volunteer Appeals)
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            যেসব মানবিক আবেদনগুলোতে স্থানীয় স্বেচ্ছাসেবী বা সহযোদ্ধাদের মাঠপর্যায়ে সরাসরি অংশগ্রহণ প্রয়োজন
          </p>
        </div>

        {user?.role !== 'VOLUNTEER' && (
          <button
            onClick={onOpenVolunteerRegister}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-2xl text-xs sm:text-sm font-extrabold shadow-sm transition cursor-pointer self-start md:self-auto"
          >
            স্বেচ্ছাসেবক হিসেবে নিবন্ধন করুন →
          </button>
        )}
      </div>

      {joinedSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{joinedSuccessMessage}</span>
        </div>
      )}

      {/* Volunteer Policy notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>স্বেচ্ছাসেবকদের দায়িত্ব ও সমন্বয়:</strong> এখানে শুধুমাত্র যাচাইকৃত মানবিক
          সহায়তার আহ্বান প্রদর্শিত হয়। আপনি “আমি সাহায্য করতে চাই” নির্বাচন করলে আপনার সাথে
          আবেদনকারী ও অন্যান্য সহকর্মীদের যোগাযোগ সমন্বয় স্থাপিত হবে। কাজ শেষ হলে ড্যাশবোর্ড
          থেকে &quot;সহায়তা সম্পন্ন হয়েছে&quot; চিহ্নিত করতে পারেন।
        </div>
      </div>

      {/* Appeals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">আহ্বান তালিকা লোড হচ্ছে...</div>
        ) : visibleAppeals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            এই মুহূর্তে কোনো খোলা স্বেচ্ছাসেবক আহ্বান নেই। নতুন কোনো প্রয়োজনে এখানে নোটিশ আসবে।
          </div>
        ) : (
          visibleAppeals.map((appeal) => (
            <div
              key={appeal.id}
              className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    স্বেচ্ছাসেবক আহ্বান
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                    {appeal.requestCategory || 'মানবিক সহায়তা'}
                  </span>
                  {appeal.requestUrgency === 'জরুরি' && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> জরুরি
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                    <Clock className="w-3 h-3" />
                    {new Date(appeal.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <h3
                  onClick={() => onSelectRequest(appeal.requestId)}
                  className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug hover:text-emerald-700 cursor-pointer"
                >
                  {appeal.requestTitle || 'মানবিক সহায়তা আবেদন'}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {appeal.message ||
                    'এই এলাকায় একজন সুবিধাবঞ্চিত মানুষের সহায়তার জন্য স্বেচ্ছাসেবক প্রয়োজন।'}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>এলাকা: <strong>{appeal.area}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <button
                  onClick={() => handleDismiss(appeal.id)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  পরে দেখব
                </button>
                <button
                  onClick={() => onSelectRequest(appeal.requestId)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  বিস্তারিত
                </button>
                <button
                  onClick={() => handleJoinVolunteer(appeal.requestId)}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>আমি সাহায্য করতে চাই</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
