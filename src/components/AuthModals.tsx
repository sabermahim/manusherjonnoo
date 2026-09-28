import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AlertCircle,
  Eye,
  EyeOff,
  HeartHandshake,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';

interface AuthModalProps {
  type: 'LOGIN' | 'REGISTER_USER' | 'REGISTER_VOLUNTEER';
  onClose: () => void;
  onSwitchType: (type: 'LOGIN' | 'REGISTER_USER' | 'REGISTER_VOLUNTEER') => void;
  onOpenAdminLogin?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  type,
  onClose,
  onSwitchType,
  onOpenAdminLogin,
}) => {
  const { login, registerUser, registerVolunteer, loginWithGoogle, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('মিরপুর, ঢাকা');
  const [skills, setSkills] = useState('শিক্ষা সহায়তা, খাবার বিতরণ, জরুরি সেবা');
  const [availability, setAvailability] = useState('সপ্তাহান্ত (শুক্র-শনি) ও ছুটির দিন');
  const [avatar, setAvatar] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
    } finally {
      setLoading(false);
    }
  };

  const handleUserRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser({ name, email, phone, password, area, avatar });
      onClose();
    } catch (err: any) {
      setError(err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerVolunteer({
        name,
        email,
        phone,
        password,
        area,
        skills,
        availability,
        avatar,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'স্বেচ্ছাসেবক রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'গুগল দিয়ে লগইন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 overflow-y-auto font-bengali">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {type === 'LOGIN' && 'অ্যাকাউন্টে লগইন করুন'}
                {type === 'REGISTER_USER' && 'সাধারণ ব্যবহারকারী রেজিস্ট্রেশন'}
                {type === 'REGISTER_VOLUNTEER' && 'স্বেচ্ছাসেবক হিসেবে রেজিস্ট্রেশন'}
              </h3>
              <p className="text-[11px] text-emerald-100">মানুষের জন্য মানবিক নেটওয়ার্ক</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Option */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              দ্রুত পরীক্ষামূলক এক-ক্লিক লগইন:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  demoLogin('USER');
                  onClose();
                }}
                className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-center font-medium transition cursor-pointer"
              >
                👤 সাধারণ
              </button>
              <button
                type="button"
                onClick={() => {
                  demoLogin('VOLUNTEER');
                  onClose();
                }}
                className="py-1.5 px-2 bg-white hover:bg-amber-50 hover:text-amber-800 border border-slate-200 rounded-xl text-center font-medium transition cursor-pointer"
              >
                🤝 ভলান্টিয়ার
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLogin?.();
                }}
                className="py-1.5 px-2 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 rounded-xl text-center font-medium transition cursor-pointer"
              >
                🛡️ অ্যাডমিন
              </button>
            </div>
          </div>

          {/* LOGIN FORM */}
          {type === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    পাসওয়ার্ড
                  </label>
                  {onOpenAdminLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminLogin();
                      }}
                      className="text-[11px] text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
                    >
                      🛡️ অ্যাডমিন পোর্টাল
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs text-slate-400 uppercase">
                  <span className="bg-white px-2">অথবা</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.28v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.28C.46 8.21 0 10.05 0 12s.46 3.79 1.28 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.28 6.58l4.04 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
                  />
                </svg>
                <span>গুগল অ্যাকাউন্ট দিয়ে লগইন করুন</span>
              </button>

              {/* Admin Login Quick Link */}
              {onOpenAdminLogin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">অ্যাডমিন পোর্টাল</span>
                      <span className="text-[10px] text-slate-500">শুধুমাত্র সিস্টেম প্রশাসকদের জন্য</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminLogin();
                    }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg text-[11px] font-bold shadow-xs transition cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </div>
              )}

              <div className="pt-2 text-center text-xs text-slate-600 space-y-1">
                <div>
                  অ্যাকাউন্ট নেই?{' '}
                  <button
                    type="button"
                    onClick={() => onSwitchType('REGISTER_USER')}
                    className="text-emerald-600 hover:underline font-bold"
                  >
                    সাধারণ রেজিস্ট্রেশন
                  </button>
                  {' | '}
                  <button
                    type="button"
                    onClick={() => onSwitchType('REGISTER_VOLUNTEER')}
                    className="text-amber-600 hover:underline font-bold"
                  >
                    স্বেচ্ছাসেবক হোন
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* USER REGISTRATION FORM */}
          {type === 'REGISTER_USER' && (
            <form onSubmit={handleUserRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: আব্দুর রহিম"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ইমেইল ঠিকানা *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ফোন নম্বর
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭১..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    এলাকা / জেলা *
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="যেমন: মিরপুর, ঢাকা"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/25 transition cursor-pointer"
              >
                {loading ? 'রেজিস্ট্রেশন হচ্ছে...' : 'সাধারণ একাউন্ট তৈরি করুন'}
              </button>

              <div className="text-center text-xs text-slate-600 pt-2">
                ইতিমধ্যে একাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchType('LOGIN')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          )}

          {/* VOLUNTEER REGISTRATION FORM */}
          {type === 'REGISTER_VOLUNTEER' && (
            <form onSubmit={handleVolunteerRegisterSubmit} className="space-y-3">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                স্বেচ্ছাসেবক হিসেবে যোগ দিলে আপনি আপনার এলাকার মানবিক আবেদনে অংশ নেওয়ার
                বিশেষ অধিকার ও নোটিফিকেশন পাবেন।
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার পূর্ণ নাম *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: তানভীর হাসান"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইমেইল ঠিকানা *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ফোন নম্বর *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭১..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  আপনার এলাকা / জেলা *
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="যেমন: ধানমন্ডি, ঢাকা"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  যেসব বিষয়ে সাহায্য করতে পারেন (দক্ষতা) *
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="যেমন: শিক্ষা সহায়তা, ত্রাণ বিতরণ, প্রাথমিক চিকিৎসা, রক্তদান"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  কখন সময় দিতে পারবেন (Availability) *
                </label>
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="যেমন: সপ্তাহান্ত (শুক্র-শনি), প্রতিদিন বিকাল ৫টা-৮টা"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পাসওয়ার্ড *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-sm font-bold shadow-md shadow-amber-500/25 transition cursor-pointer"
              >
                {loading ? 'নিবন্ধন হচ্ছে...' : 'স্বেচ্ছাসেবক হিসেবে রেজিস্ট্রেশন সম্পন্ন করুন'}
              </button>

              <div className="text-center text-xs text-slate-600 pt-2">
                ইতিমধ্যে একাউন্ট আছে?{' '}
                <button
                  type="button"
                  onClick={() => onSwitchType('LOGIN')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  লগইন করুন
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
