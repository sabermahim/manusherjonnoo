import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { HelpCategory, HelpRequest, SmartMatchResult } from '../types/index.ts';
import { InteractiveMap } from '../components/InteractiveMap.tsx';
import {
  AlertCircle,
  AlertTriangle,
  Bookmark,
  Compass,
  Filter,
  Flame,
  Heart,
  HeartHandshake,
  Layers,
  List,
  Map as MapIcon,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface ExplorePageProps {
  initialCategory?: string;
  onSelectRequest: (id: number) => void;
  onOpenCreateRequest: () => void;
  onOpenLogin?: () => void;
}

const QUICK_SUGGESTIONS = [
  'শিক্ষা সহায়তা',
  'খাবারের প্রয়োজন',
  'জরুরি চিকিৎসা',
  'শীতবস্ত্র বিতরণ',
  'মিরপুর',
  'ধানমন্ডি',
];

export const ExplorePage: React.FC<ExplorePageProps> = ({
  initialCategory = 'সকল',
  onSelectRequest,
  onOpenCreateRequest,
  onOpenLogin,
}) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [smartMatch, setSmartMatch] = useState<SmartMatchResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedUrgency, setSelectedUrgency] = useState('সকল');
  const [selectedArea, setSelectedArea] = useState('');
  const [onlyHelpNeeded, setOnlyHelpNeeded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // View mode: 'split' | 'map' | 'list'
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');
  const [selectedMapRequestId, setSelectedMapRequestId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests({
        category: selectedCategory !== 'সকল' ? selectedCategory : undefined,
        urgency: selectedUrgency !== 'সকল' ? selectedUrgency : undefined,
        area: selectedArea || undefined,
        search: search || undefined,
        onlyHelpNeeded,
      });
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
    api.getSmartMatch().then(setSmartMatch).catch(console.error);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [selectedCategory, selectedUrgency, selectedArea, onlyHelpNeeded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleToggleBookmark = async (e: React.MouseEvent, reqId: number) => {
    e.stopPropagation();
    if (!user) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    try {
      const res = await api.toggleSaveRequest(reqId);
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, isSaved: res.saved } : r))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('আপনার ব্রাউজারে লোকেশন সুবিধা সমর্থিত নয়।');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        // Set user's area if available or default nearby
        if (user?.area) {
          setSelectedArea(user.area.split(',')[0].trim());
        } else {
          setSelectedArea('ঢাকা');
        }
      },
      () => {
        setIsLocating(false);
        alert('লোকেশন সনাক্ত করা সম্ভব হয়নি। অনুগ্রহ করে ম্যানুয়ালি এলাকা লিখুন।');
      }
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('সকল');
    setSelectedUrgency('সকল');
    setSelectedArea('');
    setOnlyHelpNeeded(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-bengali space-y-6">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            সাহায্যের সুযোগ ও মানচিত্র
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
            আপনার নিকটবর্তী বা নির্দিষ্ট এলাকায় সহায়তাপ্রার্থীদের আবেদন ও ওপেনম্যাপে তাদের আনুমানিক অবস্থান
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-2xl self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>দ্বৈত ভিউ (Split)</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>শুধুমাত্র মানচিত্র</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-emerald-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>শুধুমাত্র তালিকা</span>
          </button>
        </div>
      </div>

      {/* Smart Match Banner */}
      {smartMatch && smartMatch.recommendations.length > 0 && (
        <div className="bg-linear-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white rounded-3xl p-4 sm:p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30">
                  স্মার্ট সাহায্য মিল (Smart Match)
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-1">
                {smartMatch.summary}
              </h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                আপনার এলাকা ও আগ্রহ অনুযায়ী প্রস্তাবিত সুযোগগুলো সরাসরি দেখুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {smartMatch.recommendations.slice(0, 3).map((rec) => (
              <button
                key={rec.request.id}
                onClick={() => onSelectRequest(rec.request.id)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-3 py-2 text-left shrink-0 max-w-[200px] transition cursor-pointer"
              >
                <p className="text-xs font-bold text-white truncate">{rec.request.title}</p>
                <span className="text-[10px] text-amber-300 block truncate">{rec.matchReason}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & RADAR BAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Search bar + Area + Geolocation */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="আবেদন খুঁজুন (যেমন: শিক্ষা, খাদ্য, ঔষধ, কম্বল)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          <div className="sm:col-span-4 relative flex items-center">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              placeholder="নির্দিষ্ট এলাকা (যেমন: মিরপুর, ধানমন্ডি, চট্টগ্রাম)..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={handleLocateMe}
              title="আমার এলাকা সনাক্ত করুন"
              className="absolute right-2.5 p-1.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
            >
              <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              অনুসন্ধান করুন
            </button>
            <button
              type="button"
              onClick={clearFilters}
              title="ফিল্টার মুছুন"
              className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-2xl border border-slate-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick query chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-400 text-[11px] font-bold">জনপ্রিয় অনুসন্ধান:</span>
          {QUICK_SUGGESTIONS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (['মিরপুর', 'ধানমন্ডি'].includes(tag)) {
                  setSelectedArea(tag);
                } else {
                  setSearch(tag);
                }
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-full text-slate-600 font-medium transition cursor-pointer text-[11px]"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category + Urgency Radar + Toggle */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Categories Pill list */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('সকল')}
              className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                selectedCategory === 'সকল'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              সকল বিভাগ
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                  selectedCategory === c.name
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Urgent Help Radar Button */}
            <button
              type="button"
              onClick={() =>
                setSelectedUrgency(selectedUrgency === 'জরুরি' ? 'সকল' : 'জরুরি')
              }
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                selectedUrgency === 'জরুরি'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <Flame className="w-3.5 h-3.5" />
              <span>জরুরি সহায়তা রাডার</span>
            </button>

            {/* Volunteer needed toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={onlyHelpNeeded}
                onChange={(e) => setOnlyHelpNeeded(e.target.checked)}
                className="w-3.5 h-3.5 text-emerald-600 rounded-sm"
              />
              <span className="text-slate-700 font-semibold text-[11px]">
                স্বেচ্ছাসেবক আহ্বান সক্রিয়
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA ACCORDING TO VIEW MODE */}
      <div className="space-y-6">
        {/* Results count */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>মোট {requests.length}টি মানবিক সাহায্যের সুযোগ পাওয়া গেছে</span>
          <button
            onClick={onOpenCreateRequest}
            className="text-emerald-700 hover:underline font-bold"
          >
            + নতুন সহায়তার আবেদন করুন
          </button>
        </div>

        {/* ViewMode: SPLIT VIEW */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Requests List (5 cols) */}
            <div className="lg:col-span-5 space-y-3.5 max-h-[750px] overflow-y-auto pr-1">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">লোড হচ্ছে...</div>
              ) : requests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
                  কোনো মানবিক আবেদন পাওয়া যায়নি। ফিল্টার পরিবর্তন করুন।
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedMapRequestId(req.id)}
                    className={`p-4 rounded-3xl bg-white border transition-all cursor-pointer relative ${
                      selectedMapRequestId === req.id
                        ? 'border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200/90 hover:border-emerald-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          req.urgency === 'জরুরি'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {req.category} • {req.urgency}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleBookmark(e, req.id)}
                          className="p-1 text-slate-400 hover:text-amber-500 rounded transition"
                          title="সংরক্ষণ করুন"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${req.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                        </button>
                        <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2 mb-1.5">
                      {req.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{req.locationName}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {req.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-emerald-800 font-bold truncate max-w-[160px]">
                        প্রয়োজন: {req.requiredAssistance}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(req.id);
                        }}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        বিস্তারিত & সাহায্য
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right: Map (7 cols) */}
            <div className="lg:col-span-7 sticky top-24 rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <InteractiveMap
                requests={requests}
                selectedRequestId={selectedMapRequestId}
                onSelectRequest={onSelectRequest}
                height="650px"
              />
            </div>
          </div>
        )}

        {/* ViewMode: MAP ONLY */}
        {viewMode === 'map' && (
          <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
            <InteractiveMap
              requests={requests}
              selectedRequestId={selectedMapRequestId}
              onSelectRequest={onSelectRequest}
              height="650px"
            />
          </div>
        )}

        {/* ViewMode: LIST ONLY */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req.id)}
                className="group bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        req.urgency === 'জরুরি'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {req.category} • {req.urgency}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleBookmark(e, req.id)}
                        className="p-1 text-slate-400 hover:text-amber-500 rounded transition"
                        title="সংরক্ষণ করুন"
                      >
                        <Bookmark className={`w-4 h-4 ${req.isSaved ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-emerald-700">
                    {req.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req.locationName}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs">
                    <span className="text-slate-500 font-semibold block mb-0.5">
                      প্রয়োজনীয় সহযোগিতা:
                    </span>
                    <p className="text-slate-800 font-bold truncate">
                      {req.requiredAssistance}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="font-bold text-emerald-600 group-hover:underline flex items-center gap-1">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>আমি সাহায্য করব →</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
