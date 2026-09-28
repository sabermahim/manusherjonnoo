import React from 'react';
import { HeartHandshake, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenCreateRequest: () => void;
  onOpenVolunteerRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenCreateRequest,
  onOpenVolunteerRegister,
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 font-bengali pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white">
                মানুষের <span className="text-emerald-400">জন্য</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              একটি নিরপেক্ষ ও অরাজনৈতিক সামাজিক প্ল্যাটফর্ম, যেখানে মানুষের ছোট ছোট সহায়তা
              মিলিত হয়ে অসহায় ও সুবিধাবঞ্চিত মানুষের জীবনে আলো ছড়ায়।
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm">দ্রুত লিঙ্কসমূহ</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-emerald-400 transition"
                >
                  হোমপেজ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-emerald-400 transition"
                >
                  সহায়তা খুঁজুন ও মানচিত্র
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('appeals')}
                  className="hover:text-emerald-400 transition"
                >
                  স্বেচ্ছাসেবক আহ্বান
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCreateRequest}
                  className="hover:text-emerald-400 transition"
                >
                  সহায়তার আবেদন করুন
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVolunteerRegister}
                  className="hover:text-amber-400 transition"
                >
                  স্বেচ্ছাসেবক হিসেবে যোগ দিন
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Hotline numbers */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>জরুরি হটলাইন নম্বর</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <strong className="text-white block">জাতীয় জরুরি সেবা: ৯৯৯</strong>
                <span>পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিস</span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <strong className="text-white block">সরকারি তথ্য ও সেবা: ৩৩৩</strong>
                <span>সামাজিক সমস্যা ও ত্রাণ সহায়তা</span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <strong className="text-white block">নারী ও শিশু সহায়তা: ১০৯</strong>
                <span>২৪ ঘণ্টা বিনামূল্যে জরুরি সেবা</span>
              </div>
            </div>
          </div>

          {/* Safety & Trust */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>গোপনীয়তা ও নীতি</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              সহায়তাপ্রার্থী মানুষের মর্যাদা ও সুরক্ষার স্বার্থে কোনো সংবেদনশীল ব্যক্তিগত ফোন
              নম্বর বা সুনির্দিষ্ট বাসার ঠিকানা উন্মুক্ত করা হয় না। শুধুমাত্র নির্ভরযোগ্য
              যাচাইয়ের পর সমন্বয়ের জন্য অনুমোদিত স্বেচ্ছাসেবকদের সঙ্গে যোগাযোগ করানো হয়।
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            © ২০২৬ “মানুষের জন্য” (Manusher Jonno) প্ল্যাটফর্ম। সর্বস্বত্ব সংরক্ষিত। সুবিধাবঞ্চিত মানুষের পাশে থাকুন।
          </p>
        </div>
      </div>
    </footer>
  );
};
