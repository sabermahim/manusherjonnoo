import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { HelpRequest, NotificationItem, VolunteerAppeal } from '../types/index.ts';
import {
  AlertTriangle,
  Award,
  Bell,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  HeartHandshake,
  Layers,
  LifeBuoy,
  LogOut,
  MapPin,
  Save,
  Search,
  Settings,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';

interface VolunteerDashboardProps {
  onSelectRequest: (id: number) => void;
}

export const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({
  onSelectRequest,
}) => {
  const { user, volunteerInfo, logout, refreshUser } = useAuth();

  // Exactly the 6 sections required by Requirement 12:
  // কাছাকাছি সাহায্যের সুযোগ | স্বেচ্ছাসেবক আবেদন | চলমান কার্যক্রম | সম্পন্ন কার্যক্রম | আমার availability | নোটিফিকেশন
  const [activeTab, setActiveTab] = useState<
    'nearby' | 'appeals' | 'ongoing' | 'completed' | 'availability' | 'notifications'
  >('ongoing');

  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [appeals, setAppeals] = useState<VolunteerAppeal[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile / availability fields
  const [skills, setSkills] = useState(volunteerInfo?.skills || 'শিক্ষা সহায়তা, খাবার বিতরণ');
  const [availability, setAvailability] = useState(volunteerInfo?.availability || 'সপ্তাহান্ত (শুক্র-শনি)');
  const [isAvailable, setIsAvailable] = useState(volunteerInfo?.isAvailable ?? true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allReqs, allAppeals, notifs] = await Promise.all([
        api.getRequests(),
        api.getAppeals(),
        api.getNotifications().catch(() => []),
      ]);
      setRequests(allReqs);
      setAppeals(allAppeals);
      setNotifications(notifs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ongoingRequests = requests.filter(
    (r) => r.assignedVolunteerId === user?.id && r.status !== 'সম্পন্ন'
  );

  const completedRequests = requests.filter(
    (r) => r.assignedVolunteerId === user?.id && r.status === 'সম্পন্ন'
  );

  const userArea = user?.area ? user.area.split(',')[0].trim() : '';
  const nearbyRequests = requests.filter(
    (r) => !r.assignedVolunteerId && r.status !== 'সম্পন্ন'
  );

  const handleJoinAppeal = async (requestId: number) => {
    try {
      await api.joinVolunteer(requestId);
      await loadData();
      alert('আপনি এই মানবিক কার্যক্রমে যুক্ত হয়েছেন!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCompleteActivity = async (requestId: number) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই সহায়তা কার্যক্রমটি সম্পন্ন হয়েছে?')) return;
    try {
      await api.updateRequestStatus(requestId, { status: 'সম্পন্ন' });
      await loadData();
      alert('কার্যক্রমটি সফলভাবে সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateVolunteerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess('');
    try {
      await api.updateProfile({ skills, availability, isAvailable });
      await refreshUser();
      setProfileSuccess('স্বেচ্ছাসেবক প্রাপ্যতা তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-bengali space-y-8">
      {/* Volunteer Dashboard Header */}
      <div className="bg-linear-to-r from-amber-700 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-2xl font-black text-amber-200 shadow-inner">
              {user?.name.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  নিবন্ধিত স্বেচ্ছাসেবক (VOLUNTEER)
                </span>
                <span className="text-xs text-amber-200 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {user?.area || 'ঢাকা'}
                </span>
                {isAvailable ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    উপলব্ধ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 text-[10px] font-bold">
                    অনুপলব্ধ
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                স্বেচ্ছাসেবক কার্যক্রম
              </h1>
              <p className="text-xs sm:text-sm text-amber-100">
                স্বাগতম, {user?.name}! সমাজে ইতিবাচক পরিবর্তন আনতে আপনার নিবেদিত সেবামূলক কার্যক্রম
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition flex items-center gap-1.5 cursor-pointer"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* 6 Tabs matching Requirement 12 */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-amber-600/60 pt-4">
          {[
            { id: 'nearby', label: 'কাছাকাছি সাহায্যের সুযোগ', icon: MapPin, count: nearbyRequests.length },
            { id: 'appeals', label: 'স্বেচ্ছাসেবক আবেদন', icon: Users, count: appeals.length },
            { id: 'ongoing', label: 'চলমান কার্যক্রম', icon: LifeBuoy, count: ongoingRequests.length },
            { id: 'completed', label: 'সম্পন্ন কার্যক্রম', icon: CheckCircle2, count: completedRequests.length },
            { id: 'availability', label: 'আমার availability', icon: Calendar },
            { id: 'notifications', label: 'নোটিফিকেশন', icon: Bell, count: notifications.filter((n) => !n.isRead).length },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-amber-900 shadow-md'
                    : 'text-amber-100 hover:text-white hover:bg-amber-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === tab.id
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-amber-950 text-white'
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

      {/* TAB 1: কাছাকাছি সাহায্যের সুযোগ */}
      {activeTab === 'nearby' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">কাছাকাছি সাহায্যের সুযোগ</h2>
            <p className="text-xs text-slate-500">
              যেসব আবেদনে এখনো স্বেচ্ছাসেবক যুক্ত হয়নি এবং জরুরি সহায়তা প্রয়োজন
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyRequests.length === 0 ? (
              <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                বর্তমানে উন্মুক্ত কোনো আবেদন নেই।
              </div>
            ) : (
              nearbyRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-amber-400 hover:shadow-lg transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold">
                        {req.category}
                      </span>
                      <span className="text-slate-400 font-mono">#{req.id}</span>
                    </div>
                    <h3
                      onClick={() => onSelectRequest(req.id)}
                      className="font-extrabold text-base text-slate-900 hover:text-amber-700 cursor-pointer"
                    >
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{req.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {req.locationName}
                    </span>
                    <button
                      onClick={() => handleJoinAppeal(req.id)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                    >
                      সহায়তায় যুক্ত হোন
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: স্বেচ্ছাসেবক আবেদন */}
      {activeTab === 'appeals' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">স্বেচ্ছাসেবক আবেদন (Volunteer Appeals)</h2>
            <p className="text-xs text-slate-500">
              জরুরি ভিত্তিতে মানবসম্পদ ও স্বেচ্ছাসেবক চেয়ে করা আবেদনসমূহ
            </p>
          </div>

          <div className="space-y-4">
            {appeals.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                বর্তমানে কোনো স্বেচ্ছাসেবক আবেদন উন্মুক্ত নেই।
              </div>
            ) : (
              appeals.map((appeal) => (
                <div
                  key={appeal.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-amber-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 font-bold text-xs">
                        {appeal.requestUrgency === 'জরুরি' ? '🚨 জরুরি প্রয়োজন' : 'স্বেচ্ছাসেবক আহ্বান'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        প্রয়োজন: {appeal.volunteerCount || 1} জন
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectRequest(appeal.requestId)}
                      className="font-bold text-base text-slate-900 hover:text-amber-700 cursor-pointer"
                    >
                      {appeal.requestTitle || appeal.message}
                    </h3>
                    <p className="text-xs text-slate-500">{appeal.message}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {appeal.area}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinAppeal(appeal.requestId)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-center"
                  >
                    আবেদনে যোগ দিন
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: চলমান কার্যক্রম */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">চলমান কার্যক্রম</h2>
            <p className="text-xs text-slate-500">
              আপনি যেসব মানবিক সহায়তায় দায়িত্ব পালন করছেন এবং কাজ এগিয়ে চলছে
            </p>
          </div>

          <div className="space-y-4">
            {ongoingRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">
                  বর্তমানে আপনার কোনো চলমান কার্যক্রম নেই
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  “কাছাকাছি সাহায্যের সুযোগ” ট্যাব থেকে নতুন মানবিক উদ্যোগে যুক্ত হতে পারেন।
                </p>
                <button
                  onClick={() => setActiveTab('nearby')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  সাহায্যের সুযোগ দেখুন
                </button>
              </div>
            ) : (
              ongoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 hover:border-amber-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                        {req.status}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
                        {req.category}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectRequest(req.id)}
                      className="font-bold text-base text-slate-900 hover:text-amber-700 cursor-pointer"
                    >
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-500">{req.locationName} • উপকারভোগী: {req.beneficiaryName || 'নাগরিক'}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={() => onSelectRequest(req.id)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      বিবরণ দেখুন
                    </button>
                    <button
                      onClick={() => handleCompleteActivity(req.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>সম্পন্ন চিহ্নিত করুন</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: সম্পন্ন কার্যক্রম */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">সম্পন্ন কার্যক্রম</h2>
            <p className="text-xs text-slate-500">
              আপনার সফল সহায়তায় যে মানবিক কাজগুলো সফলভাবে সমাপ্ত হয়েছে
            </p>
          </div>

          <div className="space-y-3">
            {completedRequests.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                এখনো কোনো কার্যক্রম সম্পন্ন করা হয়নি।
              </div>
            ) : (
              completedRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req.id)}
                  className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/15 transition cursor-pointer flex items-center justify-between"
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
                    বিবরণ দেখুন →
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: আমার availability */}
      {activeTab === 'availability' && (
        <div className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">আমার Availability ও দক্ষতা</h2>
            <p className="text-xs text-slate-500">
              আপনি কখন ও কোন ধরনের সামাজিক কার্যক্রমে সহায়তা করতে আগ্রহী তা আপডেট রাখুন
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateVolunteerProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                উপলব্ধতা স্ট্যাটাস
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${
                    isAvailable
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  🟢 আমি বর্তমানে সহায়তা প্রদানে প্রস্তুত (Available)
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${
                    !isAvailable
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  ⚪ বর্তমানে ব্যস্ত (Not Available)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সহায়তা দেওয়ার সময় (Availability)
              </label>
              <input
                type="text"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="যেমন: সপ্তাহান্ত (শুক্র-শনি), বিকাল ৫টার পর"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                দক্ষতা ও আগ্রহ (Skills & Interests)
              </label>
              <textarea
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="যেমন: রক্তদান সমন্বয়, প্রাথমিক চিকিৎসা, খাবার বিতরণ, শিক্ষা সহায়তা..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              {savingProfile ? 'সংরক্ষণ হচ্ছে...' : 'Availability সংরক্ষণ করুন'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: নোটিফিকেশন */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">নোটিফিকেশন ও অ্যালার্ট</h2>
            <p className="text-xs text-slate-500">
              কাছাকাছি নতুন আবেদনের নোটিশ ও চলমান কার্যক্রমের হালনাগাদ
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
                    notif.isRead ? 'bg-white border-slate-200' : 'bg-amber-50/50 border-amber-200'
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
    </div>
  );
};
