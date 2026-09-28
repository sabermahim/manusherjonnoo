import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.ts';
import { AppNotification } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Bell, CheckCheck, Clock, ExternalLink, X } from 'lucide-react';

interface NotificationsDropdownProps {
  onClose: () => void;
  onNavigateToRequest: (id: number) => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  onClose,
  onNavigateToRequest,
}) => {
  const { refreshUnreadCount } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshUnreadCount();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClickItem = (n: AppNotification) => {
    handleMarkAsRead(n.id);
    if (n.link && n.link.startsWith('/requests/')) {
      const reqId = parseInt(n.link.replace('/requests/', ''), 10);
      if (!isNaN(reqId)) {
        onNavigateToRequest(reqId);
      }
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden font-bengali animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-800">নোটিফিকেশন সেন্টার</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer"
            title="সব পঠিত করুন"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            সব পঠিত
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">নোটিফিকেশন লোড হচ্ছে...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            আপনার কোনো নতুন নোটিফিকেশন নেই।
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClickItem(n)}
              className={`p-3.5 hover:bg-slate-50 transition cursor-pointer flex gap-3 ${
                !n.isRead ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full block ${
                    !n.isRead ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-snug mb-0.5">
                  {n.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(n.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {n.link && (
                    <span className="text-emerald-600 font-medium ml-auto flex items-center gap-0.5">
                      দেখুন <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
