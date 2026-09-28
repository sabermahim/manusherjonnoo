import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Bell,
  HeartHandshake,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCreateRequest: () => void;
  onOpenLogin: () => void;
  onOpenUserRegister: () => void;
  onOpenVolunteerRegister: () => void;
  onOpenAdminLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCreateRequest,
  onOpenLogin,
  onOpenUserRegister,
  onOpenVolunteerRegister,
  onOpenAdminLogin,
}) => {
  const { user, logout, demoLogin, unreadCount } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Demo Bar / Quick Switcher */}
      <div className="bg-emerald-800 text-emerald-50 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-700/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium">
            “মানুষের জন্য” সামাজিক সহায়তা প্ল্যাটফর্ম
          </span>
          <span className="hidden sm:inline text-emerald-300">|</span>
          <span className="hidden sm:inline text-emerald-200">
            সুবিধাবঞ্চিত মানুষের পাশে দাঁড়ান
          </span>
        </div>

        {/* Demo Fast Switcher */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] text-emerald-200 hidden md:inline">
            টেস্টিং সুইচ:
          </span>
          <button
            onClick={() => demoLogin('USER')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === 'USER'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-emerald-900/60 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            👤 সাধারণ ব্যবহারকারী
          </button>
          <button
            onClick={() => demoLogin('VOLUNTEER')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === 'VOLUNTEER'
                ? 'bg-amber-500 text-slate-900 shadow-xs font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🤝 স্বেচ্ছাসেবক
          </button>
          <button
            onClick={() => onOpenAdminLogin && onOpenAdminLogin()}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              user?.role === 'ADMIN'
                ? 'bg-rose-500 text-white shadow-xs font-bold'
                : 'bg-emerald-900/60 hover:bg-emerald-700 text-emerald-100'
            }`}
          >
            🛡️ অ্যাডমিন
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight block leading-tight">
                মানুষের <span className="text-emerald-600">জন্য</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block -mt-0.5">
                কমিউনিটি সহায়তা ও ভলান্টিয়ার নেটওয়ার্ক
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleTabClick('home')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                currentTab === 'home'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              হোম
            </button>
            <button
              onClick={() => handleTabClick('explore')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'explore'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <Search className="w-4 h-4" />
              সহায়তা খুঁজুন ও মানচিত্র
            </button>
            <button
              onClick={() => handleTabClick('appeals')}
              className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                currentTab === 'appeals'
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              স্বেচ্ছাসেবক আহ্বান
            </button>

            {/* Role specific dashboard links */}
            {user?.role === 'USER' && (
              <button
                onClick={() => handleTabClick('user-dashboard')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  currentTab === 'user-dashboard'
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                }`}
              >
                আমার কার্যক্রম
              </button>
            )}
            {user?.role === 'VOLUNTEER' && (
              <button
                onClick={() => handleTabClick('volunteer-dashboard')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  currentTab === 'volunteer-dashboard'
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                স্বেচ্ছাসেবক কার্যক্রম
              </button>
            )}
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleTabClick('admin-dashboard')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  currentTab === 'admin-dashboard'
                    ? 'text-rose-700 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                অ্যাডমিন কন্ট্রোল প্যানেল
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Help Request CTA */}
            <button
              onClick={onOpenCreateRequest}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>সহায়তার আবেদন</span>
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition relative cursor-pointer"
                  title="নোটিফিকেশন"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <NotificationsDropdown
                    onClose={() => setNotificationsOpen(false)}
                    onNavigateToRequest={(id) => {
                      setCurrentTab(`request-${id}`);
                      setNotificationsOpen(false);
                    }}
                  />
                )}
              </div>
            )}

            {/* User Account / Auth buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div
                  onClick={() => {
                    if (user.role === 'ADMIN') setCurrentTab('admin-dashboard');
                    else if (user.role === 'VOLUNTEER') setCurrentTab('volunteer-dashboard');
                    else setCurrentTab('user-dashboard');
                  }}
                  className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-xl transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-xs uppercase overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {user.role === 'ADMIN'
                        ? 'অ্যাডমিন'
                        : user.role === 'VOLUNTEER'
                        ? 'স্বেচ্ছাসেবক'
                        : 'ব্যবহারকারী'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                >
                  লগইন
                </button>
                <button
                  onClick={onOpenVolunteerRegister}
                  className="px-3 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl shadow-xs transition cursor-pointer"
                >
                  স্বেচ্ছাসেবক হোন
                </button>
                {onOpenAdminLogin && (
                  <button
                    onClick={onOpenAdminLogin}
                    title="অ্যাডমিন লগইন পোর্টাল"
                    className="px-2.5 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                    <span>অ্যাডমিন</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleTabClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              currentTab === 'home' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'
            }`}
          >
            হোম
          </button>
          <button
            onClick={() => handleTabClick('explore')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              currentTab === 'explore' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'
            }`}
          >
            সহায়তা খুঁজুন ও মানচিত্র
          </button>
          <button
            onClick={() => handleTabClick('appeals')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold ${
              currentTab === 'appeals' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'
            }`}
          >
            স্বেচ্ছাসেবক আহ্বান
          </button>

          {user?.role === 'USER' && (
            <button
              onClick={() => handleTabClick('user-dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50"
            >
              আমার কার্যক্রম
            </button>
          )}

          {user?.role === 'VOLUNTEER' && (
            <button
              onClick={() => handleTabClick('volunteer-dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-800 bg-amber-50"
            >
              স্বেচ্ছাসেবক কার্যক্রম
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleTabClick('admin-dashboard')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50"
            >
              অ্যাডমিন কন্ট্রোল প্যানেল
            </button>
          )}

          {!user && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold border border-slate-300 rounded-xl"
              >
                লগইন
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserRegister();
                }}
                className="w-full py-2.5 text-center text-sm font-semibold bg-emerald-600 text-white rounded-xl"
              >
                সাধারণ ব্যবহারকারী রেজিস্ট্রেশন
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenVolunteerRegister();
                }}
                className="w-full py-2.5 text-center text-sm font-bold bg-amber-500 text-slate-900 rounded-xl"
              >
                স্বেচ্ছাসেবক হিসেবে রেজিস্ট্রেশন
              </button>
              {onOpenAdminLogin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <span>অ্যাডমিন লগইন</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
