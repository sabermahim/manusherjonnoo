import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { HelpRequest, NotificationItem, SavedRequest } from '../types/index.ts';
import {
  AlertCircle,
  Bell,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  HeartHandshake,
  Layers,
  LifeBuoy,
  LogOut,
  MapPin,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

interface UserDashboardProps {
  onOpenCreateRequest: () => void;
  onSelectRequest: (id: number) => void;
}

const AVAILABILITY_OPTIONS = [
  { id: 'সকাল', label: 'সকাল', icon: Sunrise, time: '৮:০০ - ১২:০০' },
  { id: 'দুপুর', label: 'দুপুর', icon: Sun, time: '১২:০০ - ৪:০০' },
  { id: 'বিকেল', label: 'বিকেল', icon: Sunset, time: '৪:০০ - ৭:০০' },
  { id: 'রাত', label: 'রাত', icon: Moon, time: '৭:০০ - ১০:০০' },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onOpenCreateRequest,
  onSelectRequest,
}) => {
  const { user, logout, refreshUser } = useAuth();

  // Exactly the 6 sections required by Requirement 12:
  // সাহায্য খুঁজুন | সহায়তার আবেদন | আমি যাদের সাহায্য করেছি | চলমান কার্যক্রম | সম্পন্ন কার্যক্রম | নোটিফিকেশন
  const [activeTab, setActiveTab] = useState<
    'find-help' | 'my-requests' | 'assisted' | 'ongoing' | 'completed' | 'notifications' | 'profile'
  >('my-requests');

  const [allRequests, setAllRequests] = useState<HelpRequest[]>([]);
  const [myRequests, setMyRequests] = useState<HelpRequest[]>([]);
  const [assistedRequests, setAssistedRequests] = useState<HelpRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & filter for "সাহায্য খুঁজুন"
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সকল');

  // Profile update form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [area, setArea] = useState(user?.area || '');
  const [selectedSlots, setSelectedSlots] = useState<string[]>(
    user?.availabilitySlots || []
  );
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, notifs, saved] = await Promise.all([
        api.getRequests(),
        api.getNotifications().catch(() => []),
        api.getSavedRequests().catch(() => []),
      ]);

      setAllRequests(reqs);
      setNotifications(notifs);
      setSavedRequests(saved);

      // My created requests
      const mine = reqs.filter((r) => r.creatorId === user?.id);
      setMyRequests(mine);

      // Requests user assisted
      const assisted = reqs.filter(
        (r) => r.creatorId !== user?.id && (r.status === 'সহায়তা চলছে' || r.status === 'সম্পন্ন')
      );
      setAssistedRequests(assisted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setArea(user.area || '');
      setSelectedSlots(user.availabilitySlots || []);
      loadData();
    }
  }, [user]);

  // Derived datasets
  const ongoingRequests = allRequests.filter(
    (r) =>
      (r.creatorId === user?.id || r.assignedVolunteerId === user?.id) &&
      (r.status === 'সহায়তা চলছে' || r.status === 'সাহায্যকারী পাওয়া গেছে' || r.status === 'সাহায্য প্রয়োজন')
  );

  const completedRequests = allRequests.filter(
    (r) =>
      (r.creatorId === user?.id || r.assignedVolunteerId === user?.id) &&
      r.status === 'সম্পন্ন'
  );

  const filteredExplore = allRequests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'সকল' || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDeleteRequest = async (id: number) => {
    if (!window.confirm('আপনি কি এই সহায়তার আবেদনটি মুছে ফেলতে চান?')) return;
    try {
      await api.deleteRequest(id);
      setMyRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess('');
    try {
      await api.updateProfile({ name, phone, area });
      await api.updateAvailability(selectedSlots);
      await refreshUser();
      setProfileSuccess('আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-bengali space-y-8">
      {/* User Dashboard Header */}
      <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl font-black text-emerald-300 shadow-inner">
              {user?.name.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  সাধারণ ব্যবহারকারী (USER)
                </span>
                <span className="text-xs text-emerald-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user?.area || 'ঢাকা, বাংলাদেশ'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                আমার কার্যক্রম
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100">
                স্বাগতম, {user?.name}! আপনার সামাজিক সহায়তা ও মানবিক কাজের সার্বিক ড্যাশবোর্ড
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreateRequest}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>সহায়তার আবেদন তৈরি করুন</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs matching Requirement 12 */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-emerald-700/60 pt-4">
          {[
            { id: 'find-help', label: 'সাহায্য খুঁজুন', icon: Search },
            { id: 'my-requests', label: 'সহায়তার আবেদন', icon: PlusCircle, count: myRequests.length },
            { id: 'assisted', label: 'আমি যাদের সাহায্য করেছি', icon: HeartHandshake, count: assistedRequests.length },
            { id: 'ongoing', label: 'চলমান কার্যক্রম', icon: LifeBuoy, count: ongoingRequests.length },
            { id: 'completed', label: 'সম্পন্ন কার্যক্রম', icon: CheckCircle2, count: completedRequests.length },
            { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, count: notifications.filter((n) => !n.isRead).length },
            { id: 'profile', label: 'প্রোফাইল সেটিংস', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-900 shadow-md'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-emerald-900 text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: সাহায্য খুঁজুন */}
      {activeTab === 'find-help' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="এলাকা, বিষয়ের নাম বা সহায়তার বিবরণ দিয়ে খুঁজুন..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="সকল">সকল ক্যাটাগরি</option>
                <option value="জরুরি খাবার">জরুরি খাবার</option>
                <option value="চিকিৎসা ও ওষুধ">চিকিৎসা ও ওষুধ</option>
                <option value="রক্তদান">রক্তদান</option>
                <option value="শিক্ষা সহায়তা">শিক্ষা সহায়তা</option>
                <option value="বস্ত্র ও শীতবস্ত্র">বস্ত্র ও শীতবস্ত্র</option>
                <option value="আইনি ও মানসিক সহায়তা">আইনি ও মানসিক সহায়তা</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExplore.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                কোনো সহায়তার সুযোগ পাওয়া যায়নি।
              </div>
            ) : (
              filteredExplore.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-emerald-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                        {req.category}
                      </span>
                      <span className="text-slate-400 font-mono">#{req.id}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{req.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {req.locationName}
                    </span>
                    <span className="font-bold text-emerald-700 hover:underline">
                      বিস্তারিত দেখুন →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: সহায়তার আবেদন */}
      {activeTab === 'my-requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">আমার তৈরি করা সহায়তার আবেদন</h2>
              <p className="text-xs text-slate-500">
                আপনার তৈরি আবেদনগুলোর অগ্রগতি এবং গৃহীত মানবিক পদক্ষেপ ট্র্যাক করুন
              </p>
            </div>
            <button
              onClick={onOpenCreateRequest}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>নতুন আবেদন</span>
            </button>
          </div>

          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">
                  আপনি এখনো কোনো সহায়তার আবেদন করেননি
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  আপনার বা আপনার পরিচিত কারও মানবিক সাহায্যের প্রয়োজন হলে সহজেই আবেদন প্রকাশ করতে পারেন।
                </p>
                <button
                  onClick={onOpenCreateRequest}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  এখনই আবেদন করুন
                </button>
              </div>
            ) : (
              myRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">
                        {req.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          req.status === 'সম্পন্ন'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'অপেক্ষমাণ'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectRequest(req.id)}
                      className="font-bold text-base text-slate-900 hover:text-emerald-700 cursor-pointer"
                    >
                      {req.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-1">{req.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {req.locationName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => onSelectRequest(req.id)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      বিস্তারিত দেখুন
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(req.id)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                      title="আবেদন মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: আমি যাদের সাহায্য করেছি */}
      {activeTab === 'assisted' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">আমি যাদের সাহায্য করেছি</h2>
            <p className="text-xs text-slate-500">
              আপনি যেসব মানবিক সহায়তায় হাত বাড়িয়েছেন এবং অন্যদের পাশে দাঁড়িয়েছেন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assistedRequests.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                আপনি এখনো কোনো আবেদনে সহায়তার অঙ্গীকার বা যোগদান করেননি।
              </div>
            ) : (
              assistedRequests.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onSelectRequest(r.id)}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition cursor-pointer flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      সহায়তা প্রদত্ত
                    </span>
                    <h3 className="font-bold text-base text-slate-900 mt-2">{r.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{r.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{r.locationName}</span>
                    <span className="text-emerald-700 font-bold">বিবরণ দেখুন →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: চলমান কার্যক্রম */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">চলমান কার্যক্রম</h2>
            <p className="text-xs text-slate-500">
              আপনার সাথে সম্পর্কিত বর্তমানে সক্রিয় ও চলমান সামাজিক কার্যক্রম
            </p>
          </div>

          <div className="space-y-3">
            {ongoingRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                বর্তমানে কোনো চলমান কার্যক্রম নেই।
              </div>
            ) : (
              ongoingRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                      {req.status}
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{req.title}</h3>
                    <p className="text-xs text-slate-500">{req.locationName} • {req.category}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 hover:underline">
                    দেখুন →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: সম্পন্ন কার্যক্রম */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">সম্পন্ন কার্যক্রম</h2>
            <p className="text-xs text-slate-500">
              সফলভাবে সমাপ্ত হওয়া সকল সহায়তা ও মানবিক কার্যকলাপের রেকর্ড
            </p>
          </div>

          <div className="space-y-3">
            {completedRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                এখনো কোনো সম্পন্ন কার্যক্রমের রেকর্ড নেই।
              </div>
            ) : (
              completedRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 rounded-3xl transition cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      সম্পন্ন
                    </span>
                    <h3 className="font-bold text-base text-slate-900">{req.title}</h3>
                    <p className="text-xs text-slate-500">{req.locationName} • সমাপ্তির তারিখ: {new Date(req.updatedAt || req.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800">
                    পূর্ণ বিবরণ →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: নোটিফিকেশন */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">নোটিফিকেশন ও বার্তা</h2>
            <p className="text-xs text-slate-500">
              আপনার আবেদনের আপডেট, সহায়তার বার্তা ও প্ল্যাটফর্ম সতর্কবার্তা
            </p>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                কোনো নতুন নোটিফিকেশন নেই।
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition ${
                    notif.isRead ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600">{notif.message}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: প্রোফাইল সেটিংস */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">প্রোফাইল ও প্রাপ্যতা সেটিংস</h2>
            <p className="text-xs text-slate-500">আপনার যোগাযোগের তথ্য ও মানবিক সহায়তায় পাওয়ার সময়সূচি</p>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">পূর্ণ নাম</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="যেমন: ০১৭১১১১২২৩৩"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">এলাকা</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="যেমন: মিরপুর ১০, ঢাকা"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                সহায়তা প্রদানের সময়সূচি (Availability Slots)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABILITY_OPTIONS.map((slot) => {
                  const Icon = slot.icon;
                  const isSelected = selectedSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlots((prev) =>
                          prev.includes(slot.id) ? prev.filter((s) => s !== slot.id) : [...prev, slot.id]
                        );
                      }}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <div className="text-xs">{slot.label}</div>
                      <div className="text-[10px] text-slate-400">{slot.time}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              {updatingProfile ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ করুন'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
