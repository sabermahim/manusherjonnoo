import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import {
  ActivityMonitorData,
  AdminAuditLog,
  AdminStats,
  AdminUserItem,
  AdminVolunteerItem,
  HelpCategory,
  HelpRequest,
  ReportItem,
} from '../types/index.ts';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Flag,
  FolderPlus,
  HeartHandshake,
  History,
  LifeBuoy,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectRequest: (id: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectRequest }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [volunteersList, setVolunteersList] = useState<AdminVolunteerItem[]>([]);
  const [activityMonitor, setActivityMonitor] = useState<ActivityMonitorData | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'users' | 'volunteers' | 'activity-monitor' | 'requests' | 'reports' | 'logs'
  >('overview');

  // Filter states
  const [requestFilter, setRequestFilter] = useState<
    'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED'
  >('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');
  const [volunteerStatusFilter, setVolunteerStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('ALL');

  // Modal inspection states
  const [selectedUserForModal, setSelectedUserForModal] = useState<AdminUserItem | null>(null);
  const [selectedVolunteerForModal, setSelectedVolunteerForModal] = useState<AdminVolunteerItem | null>(null);

  // Category addition
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Action status loading
  const [actionInProgress, setActionInProgress] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, reqs, u, v, act, reps, logs, cats] = await Promise.all([
        api.getAdminStats(),
        api.getRequests(),
        api.getAdminUsers(),
        api.getAdminVolunteers().catch(() => []),
        api.getActivityMonitor().catch(() => null),
        api.getAdminReports(),
        api.getAdminLogs().catch(() => []),
        api.getCategories(),
      ]);
      setStats(s);
      setRequests(reqs);
      setUsersList(u);
      setVolunteersList(v);
      setActivityMonitor(act);
      setReports(reps);
      setAuditLogs(logs);
      setCategories(cats);
    } catch (e) {
      console.error('Admin data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRequestAction = async (
    id: number,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'MARK_REVIEWED'
  ) => {
    setActionInProgress(true);
    try {
      await api.adminRequestAction(id, action);
      await fetchAdminData();
    } catch (e: any) {
      alert(e.message || 'অ্যাকশন সম্পন্ন করা যায়নি।');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleToggleSuspendUser = async (user: AdminUserItem) => {
    const nextState = !user.isSuspended;
    const confirmMsg = nextState
      ? `আপনি কি নিশ্চিতভাবে ${user.name} এর অ্যাকাউন্ট স্থগিত (Suspend) করতে চান?`
      : `আপনি কি ${user.name} এর অ্যাকাউন্ট পুনরায় সক্রিয় করতে চান?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.toggleSuspendUser(user.id, nextState);
      await fetchAdminData();
      if (selectedUserForModal && selectedUserForModal.id === user.id) {
        setSelectedUserForModal({ ...selectedUserForModal, isSuspended: nextState });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleSuspendVolunteer = async (v: AdminVolunteerItem) => {
    const nextState = !v.isSuspended;
    const confirmMsg = nextState
      ? `আপনি কি নিশ্চিতভাবে স্বেচ্ছাসেবক ${v.name} এর অ্যাকাউন্ট স্থগিত করতে চান?`
      : `আপনি কি স্বেচ্ছাসেবক ${v.name} এর অ্যাকাউন্ট সক্রিয় করতে চান?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.toggleSuspendUser(v.id, nextState);
      await fetchAdminData();
      if (selectedVolunteerForModal && selectedVolunteerForModal.id === v.id) {
        setSelectedVolunteerForModal({ ...selectedVolunteerForModal, isSuspended: nextState });
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleReportAction = async (id: number, status: string) => {
    try {
      await api.updateReportStatus(id, status);
      await fetchAdminData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      await api.createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        iconName: 'HeartHandshake',
      });
      setNewCatName('');
      setNewCatDesc('');
      await fetchAdminData();
      alert('নতুন ক্যাটাগরি যুক্ত করা হয়েছে!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAddingCat(false);
    }
  };

  // Filtered requests for Help Request Management
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'PENDING') return r.status === 'অপেক্ষমাণ';
    if (requestFilter === 'VERIFIED') return r.status === 'অনুমোদিত' || r.isVerified;
    if (requestFilter === 'REJECTED') return r.status === 'বাতিল';
    if (requestFilter === 'ACTIVE')
      return (
        r.status === 'সহায়তা চলছে' ||
        r.status === 'সাহায্য প্রয়োজন' ||
        r.status === 'সাহায্যকারী পাওয়া গেছে'
      );
    if (requestFilter === 'COMPLETED') return r.status === 'সম্পন্ন';
    return true;
  });

  // Filtered users for User Management
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch));
    const matchesStatus =
      userStatusFilter === 'ALL' || u.status === userStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered volunteers for Volunteer Management
  const filteredVolunteers = volunteersList.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
      v.email.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
      (v.area && v.area.toLowerCase().includes(volunteerSearch.toLowerCase()));
    const matchesStatus =
      volunteerStatusFilter === 'ALL' || v.status === volunteerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-bengali space-y-8">
      {/* Admin Control Panel Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                সিস্টেম অ্যাডমিনিস্ট্রেশন
              </span>
              <span className="text-xs text-slate-400 font-mono">RBAC: ADMIN</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              অ্যাডমিন কন্ট্রোল প্যানেল
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              প্ল্যাটফর্মের সার্বিক ব্যবস্থাপনা, ব্যবহারকারী ও স্বেচ্ছাসেবক মনিটরিং এবং সহায়তা কার্যক্রম নিয়ন্ত্রণ
            </p>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>তথ্য রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'users', label: 'User Management' },
            { id: 'volunteers', label: 'Volunteer Management' },
            { id: 'activity-monitor', label: 'Activity Monitor' },
            { id: 'requests', label: 'Help Requests' },
            { id: 'reports', label: 'Reports' },
            { id: 'logs', label: 'System Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                currentTab === tab.id
                  ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span>প্ল্যাটফর্ম ওভারভিউ (সারসংক্ষেপ)</span>
            </h2>

            {/* Exactly the 8 required statistics from Section 5 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* মোট User */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">মোট User</span>
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats?.totalUsers ?? '...'}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">নিবন্ধিত সাধারণ নাগরিক</span>
              </div>

              {/* মোট Volunteer */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">মোট Volunteer</span>
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600">
                  {stats?.totalVolunteers ?? '...'}
                </div>
                <span className="text-[11px] text-slate-400 mt-1">নিবন্ধিত মানবতাকর্মী</span>
              </div>

              {/* Active User */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Active User</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {stats?.activeUsers ?? '...'}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1">সক্রিয় অ্যাকাউন্ট</span>
              </div>

              {/* Active Volunteer */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Active Volunteer</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {stats?.activeVolunteers ?? '...'}
                </div>
                <span className="text-[11px] text-amber-700 font-semibold mt-1">উপলব্ধ ও সক্রিয় কর্মী</span>
              </div>

              {/* Pending Help Requests */}
              <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between bg-amber-50/20">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Pending Help Requests</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600">
                  {stats?.pendingRequests ?? '...'}
                </div>
                <span className="text-[11px] text-amber-700 mt-1">অনুমোদনের অপেক্ষায়</span>
              </div>

              {/* Active Help Activities */}
              <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between bg-blue-50/20">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Active Help Activities</span>
                  <LifeBuoy className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-600">
                  {stats?.activeHelpActivities ?? '...'}
                </div>
                <span className="text-[11px] text-blue-700 mt-1">মাঠে চলমান সহায়তা</span>
              </div>

              {/* Completed Activities */}
              <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col justify-between bg-emerald-50/20">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Completed Activities</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {stats?.completedActivities ?? '...'}
                </div>
                <span className="text-[11px] text-emerald-700 mt-1">সফলভাবে সমাপ্ত</span>
              </div>

              {/* Reported Requests */}
              <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between bg-rose-50/20">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold text-slate-700">Reported Requests</span>
                  <Flag className="w-4 h-4 text-rose-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-600">
                  {stats?.reportedRequests ?? '...'}
                </div>
                <span className="text-[11px] text-rose-700 mt-1">তদন্তের অপেক্ষায়</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setCurrentTab('users')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition cursor-pointer"
            >
              <Users className="w-8 h-8 text-emerald-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-base">ব্যবহারকারী ব্যবস্থাপনা</h3>
              <p className="text-xs text-slate-500 mt-1">
                সাধারণ ব্যবহারকারীদের প্রোফাইল নিরীক্ষণ, আবেদনের ইতিহাস ও অ্যাকাউন্ট সাসপেন্ড/সক্রিয়করণ।
              </p>
            </div>

            <div
              onClick={() => setCurrentTab('volunteers')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition cursor-pointer"
            >
              <HeartHandshake className="w-8 h-8 text-amber-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-base">স্বেচ্ছাসেবক ব্যবস্থাপনা</h3>
              <p className="text-xs text-slate-500 mt-1">
                স্বেচ্ছাসেবকদের এলাকাভিত্তিক উপস্থিতি, গৃহীত কার্যক্রম ও সক্রিয়তা নিরীক্ষণ।
              </p>
            </div>

            <div
              onClick={() => setCurrentTab('activity-monitor')}
              className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition cursor-pointer"
            >
              <Activity className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-bold text-slate-900 text-base">অ্যাক্টিভিটি মনিটর</h3>
              <p className="text-xs text-slate-500 mt-1">
                কে কোন মানবিক কার্যক্রমে যুক্ত আছেন এবং বর্তমানে প্ল্যাটফর্মে কারা সক্রিয় তা পর্যবেক্ষণ।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {currentTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">User Management</h2>
              <p className="text-xs text-slate-500">
                প্ল্যাটফর্মের নিবন্ধিত সাধারণ ব্যবহারকারীদের তথ্য, সহায়তার রেকর্ড ও অ্যাকাউন্ট নিয়ন্ত্রণ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-56"
                />
              </div>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="ACTIVE">🟢 Active</option>
                <option value="INACTIVE">⚪ Inactive</option>
                <option value="SUSPENDED">🚫 Suspended</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">ব্যবহারকারী</th>
                    <th className="p-4">ইমেইল ও ফোন</th>
                    <th className="p-4">নিবন্ধন তারিখ</th>
                    <th className="p-4 text-center">আবেদন সংখ্যা</th>
                    <th className="p-4 text-center">সহায়তা সংখ্যা</th>
                    <th className="p-4">সর্বশেষ সক্রিয়</th>
                    <th className="p-4 text-center">স্ট্যাটাস</th>
                    <th className="p-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        কোনো ব্যবহারকারী পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{u.name}</span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {u.area || 'অনির্দিষ্ট'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-slate-800 block">{u.email}</span>
                          <span className="text-[10px] text-slate-500">{u.phone || 'ফোন নেই'}</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                            {u.helpRequestsCount}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                            {u.assistanceCount}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(u.lastActive).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-4 text-center">
                          {u.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              🚫 Suspended
                            </span>
                          ) : u.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              🟢 Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              ⚪ Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUserForModal(u)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                              title="প্রোফাইল দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspendUser(u)}
                              className={`p-1.5 rounded-lg cursor-pointer font-bold ${
                                u.isSuspended
                                  ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                  : 'text-rose-700 bg-rose-100 hover:bg-rose-200'
                              }`}
                              title={u.isSuspended ? 'পুনরায় সক্রিয় করুন' : 'অ্যাকাউন্ট স্থগিত করুন'}
                            >
                              {u.isSuspended ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VOLUNTEER MANAGEMENT */}
      {currentTab === 'volunteers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Volunteer Management</h2>
              <p className="text-xs text-slate-500">
                প্ল্যাটফর্মের নিবন্ধিত স্বেচ্ছাসেবকদের উপস্থিতি, সমাপ্ত কার্যক্রম ও সক্রিয়তা পর্যবেক্ষণ
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={volunteerSearch}
                  onChange={(e) => setVolunteerSearch(e.target.value)}
                  placeholder="নাম বা এলাকা দিয়ে খুঁজুন..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-56"
                />
              </div>

              <select
                value={volunteerStatusFilter}
                onChange={(e) => setVolunteerStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              >
                <option value="ALL">সকল স্ট্যাটাস</option>
                <option value="ACTIVE">🟢 Active</option>
                <option value="INACTIVE">⚪ Inactive</option>
                <option value="SUSPENDED">🚫 Suspended</option>
              </select>
            </div>
          </div>

          {/* Volunteer Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">স্বেচ্ছাসেবক</th>
                    <th className="p-4">এলাকা</th>
                    <th className="p-4">উপলব্ধতা (Availability)</th>
                    <th className="p-4 text-center">যুক্ত কার্যক্রম</th>
                    <th className="p-4 text-center">সম্পন্ন</th>
                    <th className="p-4 text-center">চলমান</th>
                    <th className="p-4">সর্বশেষ সক্রিয়</th>
                    <th className="p-4 text-center">স্ট্যাটাস</th>
                    <th className="p-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVolunteers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        কোনো স্বেচ্ছাসেবক পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-xs">
                              {v.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{v.name}</span>
                              <span className="text-[10px] text-slate-500">{v.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {v.area || 'ঢাকা'}
                        </td>
                        <td className="p-4 text-slate-600">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px]">
                            {v.availability || 'যেকোনো সময়'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700">
                            {v.joinedActivitiesCount}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {v.completedActivitiesCount}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                            {v.ongoingActivitiesCount}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(v.lastActive).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-4 text-center">
                          {v.isSuspended ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              🚫 Suspended
                            </span>
                          ) : v.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              🟢 Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              ⚪ Inactive
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedVolunteerForModal(v)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                              title="কার্যক্রম ও প্রোফাইল দেখুন"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleSuspendVolunteer(v)}
                              className={`p-1.5 rounded-lg cursor-pointer font-bold ${
                                v.isSuspended
                                  ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                  : 'text-rose-700 bg-rose-100 hover:bg-rose-200'
                              }`}
                              title={v.isSuspended ? 'পুনরায় সক্রিয় করুন' : 'স্থগিত করুন'}
                            >
                              {v.isSuspended ? (
                                <UserCheck className="w-3.5 h-3.5" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITY MONITOR */}
      {currentTab === 'activity-monitor' && (
        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>Activity Monitor (সক্রিয়তা মনিটর)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্ল্যাটফর্মে বর্তমানে কারা সক্রিয় আছেন এবং কোন মানবিক কার্যক্রম চলমান রয়েছে তার লাইভ আপডেট
                </p>
              </div>

              {/* Status legend */}
              <div className="hidden sm:flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="flex items-center gap-1 font-bold text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  🟢 Active Now
                </span>
                <span className="flex items-center gap-1 font-bold text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  🟡 Recently Active
                </span>
                <span className="flex items-center gap-1 font-bold text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  ⚪ Inactive
                </span>
              </div>
            </div>
          </div>

          {/* Section: Volunteer Activity Monitoring (Requirement 9) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-600" />
                <span>স্বেচ্ছাসেবক কার্যক্রম ট্র্যাকিং (Volunteer Activity Monitoring)</span>
              </h3>
              <span className="text-xs text-slate-400">প্ল্যাটফর্ম ব্যবস্থাপনা দৃশ্যপট</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activityMonitor?.volunteerActivityStatuses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{item.volunteerName}</span>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {item.area}
                      </span>
                    </div>

                    {item.monitorStatus === 'ACTIVE_NOW' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        🟢 Active Now
                      </span>
                    ) : item.monitorStatus === 'RECENTLY_ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        🟡 Recently Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        ⚪ Inactive
                      </span>
                    )}
                  </div>

                  {/* Flow representation matching Requirement 9 */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="text-slate-400 font-mono text-[10px]">কার্যক্রম প্রবাহ:</div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="text-amber-600 font-bold">↓</span>
                      <span className="truncate">{item.activityTitle}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-500">Status:</span>
                      <span
                        className={`font-bold ${
                          item.activityStatus === 'Ongoing'
                            ? 'text-blue-600'
                            : item.activityStatus === 'Completed'
                            ? 'text-emerald-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.activityStatus}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Ongoing Help Activities Live Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-600" />
                <span>চলমান মানবিক সহায়তা কার্যক্রম ({activityMonitor?.ongoingActivities.length || 0})</span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activityMonitor?.ongoingActivities.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => onSelectRequest(act.id)}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">#{act.id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-700">
                          {act.category}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {act.area}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{act.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        আবেদনকারী: {act.creatorName || 'নাগরিক'} • হালনাগাদ: {new Date(act.updatedAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 shrink-0">
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Active Users Monitor */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>প্ল্যাটফর্ম ব্যবহারকারী সক্রিয়তা (User Presence)</span>
              </h3>

              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {activityMonitor?.activeUsersList.map((usr) => (
                  <div
                    key={usr.id}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {usr.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{usr.name}</span>
                        <span className="text-[10px] text-slate-400">{usr.area}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {usr.monitorStatus === 'ACTIVE_NOW' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          🟢 Active Now
                        </span>
                      ) : usr.monitorStatus === 'RECENTLY_ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          🟡 Recently Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          ⚪ Inactive
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 mt-0.5">{usr.lastSeen}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HELP REQUEST MANAGEMENT */}
      {currentTab === 'requests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Help Request Management</h2>
              <p className="text-xs text-slate-500">
                সকল মানবিক সহায়তার আবেদন নিরীক্ষণ, অনুমোদন, বাতিল ও স্থগিতকরণ
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'সকল আবেদন' },
                { id: 'PENDING', label: 'অপেক্ষমাণ' },
                { id: 'VERIFIED', label: 'অনুমোদিত' },
                { id: 'REJECTED', label: 'বাতিল' },
                { id: 'ACTIVE', label: 'চলমান সহায়তা' },
                { id: 'COMPLETED', label: 'সম্পন্ন' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRequestFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    requestFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">Request ID & শিরোনাম</th>
                    <th className="p-4">আবেদনকারী (Creator)</th>
                    <th className="p-4">ক্যাটাগরি</th>
                    <th className="p-4">এলাকা</th>
                    <th className="p-4">তারিখ</th>
                    <th className="p-4 text-center">স্ট্যাটাস</th>
                    <th className="p-4 text-center">স্বেচ্ছাসেবক অবস্থা</th>
                    <th className="p-4 text-right">অ্যাডমিন অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        এই ফিল্টারে কোনো আবেদন নেই।
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-500">#{r.id}</span>
                            <span
                              onClick={() => onSelectRequest(r.id)}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline cursor-pointer block max-w-xs truncate"
                            >
                              {r.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800 block">
                            {r.creatorName || `ইউজার #${r.creatorId}`}
                          </span>
                          <span className="text-[10px] text-slate-400">{r.contactPhone || 'ফোন নেই'}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-medium text-slate-700">
                            {r.category}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">
                          {r.locationName}
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              r.status === 'অনুমোদিত'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.status === 'অপেক্ষমাণ'
                                ? 'bg-amber-100 text-amber-800'
                                : r.status === 'বাতিল'
                                ? 'bg-rose-100 text-rose-800'
                                : r.status === 'স্থগিত'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {r.assignedVolunteerId ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                              স্বেচ্ছাসেবক যুক্ত
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">খালি</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Approve */}
                            <button
                              onClick={() => handleRequestAction(r.id, 'APPROVE')}
                              disabled={actionInProgress}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                              title="অনুমোদন করুন"
                            >
                              Approve
                            </button>
                            {/* Reject */}
                            <button
                              onClick={() => handleRequestAction(r.id, 'REJECT')}
                              disabled={actionInProgress}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                              title="বাতিল করুন"
                            >
                              Reject
                            </button>
                            {/* Suspend */}
                            <button
                              onClick={() => handleRequestAction(r.id, 'SUSPEND')}
                              disabled={actionInProgress}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-[11px] cursor-pointer"
                              title="স্থগিত করুন"
                            >
                              Suspend
                            </button>
                            {/* Mark reviewed */}
                            <button
                              onClick={() => handleRequestAction(r.id, 'MARK_REVIEWED')}
                              disabled={actionInProgress}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg font-bold text-[11px] cursor-pointer"
                              title="যাচাই হচ্ছে চিহ্নিত করুন"
                            >
                              Reviewed
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {currentTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">অভিযোগ ও রিপোর্ট ব্যবস্থাপনা</h2>
            <p className="text-xs text-slate-500">
              ব্যবহারকারীদের প্রেরিত অভিযোগ যাচাই এবং নিরাপত্তা পর্যালোচনা
            </p>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400">
                কোনো অভিযোগ জমা পড়েনি।
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-slate-500">
                        রিপোর্টার: {rep.reporterName || 'বেনামী'} ({rep.reporterEmail || 'ইমেইল নেই'})
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(rep.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      আবেদন: {rep.requestTitle || `#${rep.requestId}`}
                    </h4>
                    {rep.details && <p className="text-xs text-slate-600">{rep.details}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReportAction(rep.id, 'DISMISSED')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      খারিজ করুন
                    </button>
                    <button
                      onClick={() => handleReportAction(rep.id, 'REVIEWED')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      সমাধান চিহ্নিত
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM LOGS */}
      {currentTab === 'logs' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">System Logs (অডিট ট্রেইল)</h2>
            <p className="text-xs text-slate-500">
              প্ল্যাটফর্মে প্রশাসকদের গৃহীত গুরুত্বপূর্ণ কার্যক্রমের অপরিবর্তনযোগ্য রেকর্ড
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="p-4">সময়</th>
                    <th className="p-4">অ্যাকশন</th>
                    <th className="p-4">টার্গেট টাইপ</th>
                    <th className="p-4">টার্গেট ID</th>
                    <th className="p-4">বিস্তারিত</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                        কোনো লগ রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 text-slate-500">
                          {new Date(log.createdAt).toLocaleString('bn-BD')}
                        </td>
                        <td className="p-4 font-bold text-amber-800">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-4 text-slate-700 font-sans">{log.targetType}</td>
                        <td className="p-4 text-slate-500">#{log.targetId}</td>
                        <td className="p-4 text-slate-800 font-sans text-xs">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {selectedUserForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-bengali">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedUserForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-lg">
                {selectedUserForModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedUserForModal.name}</h3>
                <span className="text-xs text-slate-500">{selectedUserForModal.email}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">এলাকা:</span>
                <span className="font-bold text-slate-800">{selectedUserForModal.area || 'অনির্দিষ্ট'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">ফোন:</span>
                <span className="font-bold text-slate-800">{selectedUserForModal.phone || 'নেই'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">নিবন্ধনের তারিখ:</span>
                <span className="font-bold text-slate-800">
                  {new Date(selectedUserForModal.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">মোট সহায়তার আবেদন:</span>
                <span className="font-bold text-slate-800">{selectedUserForModal.helpRequestsCount} টি</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">অন্যদের সহায়তা করেছে:</span>
                <span className="font-bold text-slate-800">{selectedUserForModal.assistanceCount} বার</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">বর্তমান স্ট্যাটাস:</span>
                <span className="font-bold text-slate-800">
                  {selectedUserForModal.isSuspended ? '🚫 Suspended' : '🟢 Active'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleSuspendUser(selectedUserForModal)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedUserForModal.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {selectedUserForModal.isSuspended ? 'অ্যাকাউন্ট পুনরায় সক্রিয় করুন' : 'অ্যাকাউন্ট স্থগিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VOLUNTEER DETAIL MODAL */}
      {selectedVolunteerForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs font-bengali">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVolunteerForModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-lg">
                {selectedVolunteerForModal.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedVolunteerForModal.name}</h3>
                <span className="text-xs text-slate-500">{selectedVolunteerForModal.email}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">এলাকা:</span>
                <span className="font-bold text-slate-800">{selectedVolunteerForModal.area || 'ঢাকা'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">দক্ষতা (Skills):</span>
                <span className="font-bold text-slate-800">{selectedVolunteerForModal.skills || 'সাধারণ সহায়তা'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">উপলব্ধতা (Availability):</span>
                <span className="font-bold text-slate-800">{selectedVolunteerForModal.availability || 'যেকোনো সময়'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">গৃহীত কার্যক্রম সংখ্যা:</span>
                <span className="font-bold text-slate-800">{selectedVolunteerForModal.joinedActivitiesCount} টি</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">সম্পন্ন কার্যক্রম:</span>
                <span className="font-bold text-emerald-700">{selectedVolunteerForModal.completedActivitiesCount} টি</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">চলমান কার্যক্রম:</span>
                <span className="font-bold text-blue-700">{selectedVolunteerForModal.ongoingActivitiesCount} টি</span>
              </div>
            </div>

            {/* Recent Activities list */}
            <div className="space-y-2 mb-4">
              <h4 className="font-bold text-xs text-slate-800">সাম্প্রতিক কার্যক্রম রেকর্ড:</h4>
              {selectedVolunteerForModal.recentActivities && selectedVolunteerForModal.recentActivities.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedVolunteerForModal.recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">
                          {act.requestTitle || `কার্যক্রম #${act.requestId}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.joinedAt).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">কোনো কার্যক্রমের ইতিহাস নেই।</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleToggleSuspendVolunteer(selectedVolunteerForModal)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  selectedVolunteerForModal.isSuspended
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {selectedVolunteerForModal.isSuspended ? 'স্বেচ্ছাসেবক পুনরায় সক্রিয় করুন' : 'স্বেচ্ছাসেবক স্থগিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
