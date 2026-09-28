import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { HelpCategory, HelpRequest } from '../types/index.ts';
import { InteractiveMap } from '../components/InteractiveMap.tsx';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  PlusCircle,
  Search,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Users,
  Utensils,
} from 'lucide-react';

interface HomePageProps {
  onOpenCreateRequest: () => void;
  onOpenVolunteerRegister: () => void;
  onNavigateToExplore: (cat?: string) => void;
  onSelectRequest: (id: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenCreateRequest,
  onOpenVolunteerRegister,
  onNavigateToExplore,
  onSelectRequest,
}) => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('সকল');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reqs, cats] = await Promise.all([
          api.getRequests(),
          api.getCategories(),
        ]);
        setRequests(reqs);
        setCategories(cats);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5" />;
      case 'Shirt':
        return <Shirt className="w-5 h-5" />;
      case 'Stethoscope':
        return <Stethoscope className="w-5 h-5" />;
      case 'Home':
        return <Home className="w-5 h-5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <HeartHandshake className="w-5 h-5" />;
    }
  };

  const filteredRequests =
    activeCategoryFilter === 'সকল'
      ? requests
      : requests.filter((r) => r.category === activeCategoryFilter);

  const emergencyRequests = requests.filter(
    (r) => r.urgency === 'জরুরি' && r.status !== 'সম্পন্ন'
  );

  return (
    <div className="font-bengali space-y-12 sm:space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-800 to-teal-900 text-white pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-semibold shadow-xs backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>বাংলাদেশি কমিউনিটি মানবিক উদ্যোগ</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            মানুষের জন্য
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-emerald-100/90 font-medium max-w-3xl mx-auto leading-relaxed">
            আপনার সামান্য সহযোগিতা, কারও জীবনে বড় পরিবর্তন আনতে পারে।
          </p>

          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl mx-auto leading-normal">
            আপনার আশপাশের অসহায় বা সুবিধাবঞ্চিত মানুষের প্রয়োজনের কথা জানান, অথবা একজন স্বেচ্ছাসেবী
            ও শুভাকাঙ্ক্ষী হিসেবে সরাসরি সহায়তার হাত বাড়িয়ে দিন।
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => onNavigateToExplore()}
              className="px-6 sm:px-8 py-3.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-sm sm:text-base font-extrabold shadow-lg shadow-black/20 hover:scale-[1.02] transition cursor-pointer flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              <span>সহায়তা খুঁজুন</span>
            </button>

            <button
              onClick={onOpenCreateRequest}
              className="px-6 sm:px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-sm sm:text-base font-extrabold shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition cursor-pointer flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>সহায়তার আবেদন করুন</span>
            </button>

            <button
              onClick={onOpenVolunteerRegister}
              className="px-6 sm:px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-sm sm:text-base font-extrabold shadow-lg shadow-amber-500/30 hover:scale-[1.02] transition cursor-pointer flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>স্বেচ্ছাসেবক হোন</span>
            </button>
          </div>

          {/* Live Quick Counter */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-white block">
                {requests.length}+
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                যাচাইকৃত মানবিক আবেদন
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 block">
                {requests.filter((r) => r.volunteerNeeded).length}+
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                স্বেচ্ছাসেবক আহ্বান সক্রিয়
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 block">
                {requests.filter((r) => r.status === 'সম্পন্ন').length + 5}+
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                সফল মানবিক সহায়তা
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-300 block">
                ১০০%
              </span>
              <span className="text-xs text-emerald-200 font-medium">
                গোপনীয়তা ও ভেরিফিকেশন
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY URGENT HELP BANNER (IF ANY) */}
      {emergencyRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-3xl shadow-xl shadow-rose-900/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 animate-pulse">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-md bg-white text-rose-700 text-[10px] font-black uppercase tracking-wider inline-block mb-0.5">
                  তাৎক্ষণিক জরুরি আবেদন ({emergencyRequests.length}টি)
                </span>
                <h3 className="font-bold text-base sm:text-lg leading-tight">
                  {emergencyRequests[0].title}
                </h3>
                <p className="text-xs text-rose-100">
                  এলাকা: {emergencyRequests[0].locationName} • প্রয়োজন:{' '}
                  {emergencyRequests[0].requiredAssistance}
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectRequest(emergencyRequests[0].id)}
              className="px-5 py-2.5 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-xs sm:text-sm font-bold shadow transition cursor-pointer whitespace-nowrap"
            >
              এখনই সাহায্য করুন →
            </button>
          </div>
        </section>
      )}

      {/* INTERACTIVE HELP MAP PREVIEW SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              <span>লাইভ ইন্টারঅ্যাক্টিভ ওপেনম্যাপ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              আপনার আশপাশের যাচাইকৃত মানবিক আবেদনসমূহ
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl">
              মানচিত্রে ক্লিক করে আপনার নিকটবর্তী সহায়তার প্রয়োজন জানুন। ব্যক্তির গোপনীয়তা
              রক্ষায় শুধুমাত্র আনুমানিক এলাকা নির্দেশ করা হয়েছে।
            </p>
          </div>

          <button
            onClick={() => onNavigateToExplore()}
            className="self-start md:self-auto text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>সম্পূর্ণ মানচিত্র দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills directly above map */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategoryFilter('সকল')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeCategoryFilter === 'সকল'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            সকল আবেদন ({requests.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryFilter(c.name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === c.name
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Interactive Map Component */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80">
          <InteractiveMap
            requests={filteredRequests}
            onSelectRequest={onSelectRequest}
            height="460px"
          />
        </div>
      </section>

      {/* HELP CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            সহায়তার ক্ষেত্রসমূহ
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            যে ধরনের সহযোগিতায় আপনি বা আপনার এলাকার মানুষ অংশ নিতে পারেন
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {categories.map((cat) => {
            const count = requests.filter((r) => r.category === cat.name).length;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigateToExplore(cat.name)}
                className="group p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center mb-3">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {cat.description || 'মানবিক সহযোগিতার উদ্যোগ'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
                  <span>{count}টি আবেদন সক্রিয়</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECENT VERIFIED HELP REQUESTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              সাম্প্রতিক সহায়তার আবেদন
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              যাচাইকৃত আবেদনকারীদের সরাসরি সহায়তা করুন অথবা স্বেচ্ছাসেবক হিসেবে পাশে দাঁড়ান
            </p>
          </div>
          <button
            onClick={() => onNavigateToExplore()}
            className="text-emerald-600 hover:text-emerald-700 text-xs sm:text-sm font-bold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>সবগুলো দেখুন ({requests.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">তথ্য লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.slice(0, 6).map((req) => (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req.id)}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Image if available, else decorative pattern */}
                  {req.imageUrl ? (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={req.imageUrl}
                        alt={req.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-28 bg-gradient-to-r from-emerald-100 to-teal-50 flex items-center justify-center p-4 text-emerald-800">
                      <HeartHandshake className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {/* Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          req.urgency === 'জরুরি'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {req.category} • {req.urgency}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {req.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                      {req.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{req.locationName}</span>
                    </div>

                    {/* Required item highlighted */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-500 font-semibold block mb-0.5">
                        প্রয়োজনীয় সহযোগিতা:
                      </span>
                      <p className="text-slate-800 font-bold truncate">
                        {req.requiredAssistance}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(req.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                    বিস্তারিত দেখুন →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS (কীভাবে কাজ করে) */}
      <section className="bg-slate-100/80 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              সহজ ও মানবিক প্রক্রিয়া
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              প্ল্যাটফর্মটি যেভাবে কাজ করে
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              মানুষ খুঁজুন → প্রয়োজন দেখুন → সাহায্য করুন → প্রয়োজনে স্বেচ্ছাসেবক ডাকুন → সহায়তা সম্পন্ন করুন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                ০১
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">আবেদন তৈরি</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                আপনার এলাকার কোনো অসহায় বা সুবিধাবঞ্চিত মানুষের হয়ে তার মূল প্রয়োজন উল্লেখ করে
                সহায়তার আবেদন জানান।
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 text-xs font-black flex items-center justify-center">
                ০২
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">যাচাই ও মানচিত্রায়ন</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অ্যাডমিন টিম আবেদনটি যাচাই করে অনুমোদন দিলে তা পাবলিক মানচিত্রে আনুমানিক এলাকা
                হিসেবে দৃশ্যমান হয়।
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                ০৩
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">সহায়তা ও ভলান্টিয়ার</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                সাধারণ নাগরিক সরাসরি সহায়তা করার অঙ্গীকার করতে পারেন অথবা প্রয়োজন হলে
                স্বেচ্ছাসেবকরা সরাসরি যুক্ত হয়ে সমন্বয় করেন।
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">
                ০৪
              </span>
              <h3 className="font-extrabold text-slate-900 text-base">সহায়তা সম্পন্ন</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                সহায়তা সফলভাবে পৌঁছে দেওয়ার পর তা &quot;সহায়তা সম্পন্ন হয়েছে&quot; হিসেবে চিহ্নিত হয় এবং
                কার্যক্রম সমাপ্ত হয়।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SAFETY & PRIVACY GUARANTEE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 bg-emerald-900 text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>নিরাপত্তা, গোপনীয়তা ও মানবিক মর্যাদা রক্ষা</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold leading-tight">
              সুবিধাবঞ্চিত মানুষের মর্যাদা আমাদের সর্বোচ্চ অগ্রাধিকার
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              প্ল্যাটফর্মে কখনোই কারও ব্যক্তিগত ফোন নম্বর বা সুনির্দিষ্ট বাসার ঠিকানা উন্মুক্ত করা হয় না।
              প্রতিটি আবেদন ভেরিফিকেশন প্রক্রিয়ার মধ্য দিয়ে যায় এবং সন্দেহজনক তথ্য তাৎক্ষণিক
              রিপোর্টের ব্যবস্থা রয়েছে।
            </p>
          </div>
          <button
            onClick={onOpenCreateRequest}
            className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition cursor-pointer whitespace-nowrap"
          >
            একটি মানবিক আবেদন জানান →
          </button>
        </div>
      </section>
    </div>
  );
};
