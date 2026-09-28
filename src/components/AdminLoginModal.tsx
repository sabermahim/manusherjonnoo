import React, { useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectDemoLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login('admin@mail.com', 'pass123456');
      if (loggedUser.role === 'ADMIN') {
        onSuccess();
        onClose();
      } else {
        throw new Error('অ্যাডমিন অনুমোদিত নয়');
      }
    } catch (err: any) {
      setError('অ্যাডমিন লগইন করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(email.trim(), password.trim());
      // Strictly verify ADMIN role
      if (loggedUser.role !== 'ADMIN') {
        throw new Error('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
      }
      setEmail('');
      setPassword('');
      onSuccess();
      onClose();
    } catch (err: any) {
      // Exact Bangladeshi error message
      setError('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs font-bengali">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto mb-3.5 shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center mb-5">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-slate-900 text-amber-400 mb-2">
            অ্যাডমিন প্রবেশদ্বার (ADMIN)
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            অ্যাডমিন লগইন
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            শুধুমাত্র অনুমোদিত সিস্টেম প্রশাসকদের জন্য সংরক্ষিত
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ইমেইল
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                className="w-full text-xs sm:text-sm pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                পাসওয়ার্ড
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'লুকান' : 'দেখান'}</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="w-full text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          {error && (
            <div className="text-xs text-rose-700 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-1 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white">যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>

            {/* Instant Direct Demo Login */}
            <button
              type="button"
              onClick={handleDirectDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>১-ক্লিকে সরাসরি অ্যাডমিন ড্যাশবোর্ডে প্রবেশ</span>
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>সিস্টেম নিরাপত্তা: সকল প্রবেশাধিকার প্রচেষ্টা রেকর্ড করা হয়।</span>
          </p>
        </div>
      </div>
    </div>
  );
};
