import {
  ActivityMonitorData,
  AdminAuditLog,
  AdminStats,
  AdminUserItem,
  AdminVolunteerItem,
  HelpCategory,
  HelpRequest,
  NotificationItem,
  ReportItem,
  SavedRequest,
  SmartMatchResult,
  User,
  VolunteerAppeal,
} from '../types/index.ts';

const ADMIN_EMAIL = 'admin@mail.com';
const ADMIN_PASSWORD = 'pass123456';

const INITIAL_CATEGORIES: HelpCategory[] = [
  { id: 1, name: 'শিক্ষা সহায়তা', icon: 'GraduationCap', description: 'বই-খাতা, স্কুল ড্রেস, বেতন বা পড়ালেখার প্রয়োজনীয় সামগ্রী প্রদান।' },
  { id: 2, name: 'খাবার', icon: 'Utensils', description: 'অনাহারে থাকা পরিবার বা প্রবীণদের খাদ্য সামগ্রী ও রান্না করা খাবার বিতরণ।' },
  { id: 3, name: 'পোশাক', icon: 'Shirt', description: 'শীতবস্ত্র, শিশুদের জামাকাপড় ও মৌলিক পোশাক সহায়তা।' },
  { id: 4, name: 'চিকিৎসা সহায়তা', icon: 'Stethoscope', description: 'প্রেসক্রিপশন ওষুধ, প্রাথমিক চিকিৎসা সরঞ্জাম বা হাসপাতালের জরুরি চিকিৎসা সহায়তা।' },
  { id: 5, name: 'জরুরি সহায়তা', icon: 'AlertTriangle', description: 'দুর্যোগ, দুর্ঘটনা বা তাৎক্ষণিক বিপদে জীবনরক্ষাকারী মানবিক সহায়তা।' },
  { id: 6, name: 'বাসস্থান সহায়তা', icon: 'Home', description: 'ছাদ মেরামত, পলিথিন/টিন বা অস্থায়ী আশ্রয় নিশ্চিতকরণ।' },
  { id: 7, name: 'দৈনন্দিন প্রয়োজন', icon: 'ShoppingBag', description: 'হুইলচেয়ার, চশমা বা প্রতিবন্ধী ব্যক্তিদের চলাচলের সহায়ক উপকরণ।' },
  { id: 8, name: 'অন্যান্য', icon: 'HeartHandshake', description: 'অন্যান্য সামাজিক ও মানবিক সহযোগিতা।' },
];

const INITIAL_ADMIN: User = {
  id: 1,
  uid: 'admin_sys_01',
  email: 'admin@mail.com',
  name: 'মানুষের জন্য অ্যাডমিন',
  phone: '০১৭০০০০০০০০',
  role: 'ADMIN',
  area: 'কেন্দ্রীয় নিয়ন্ত্রণ কক্ষ, ঢাকা',
  isSuspended: false,
  createdAt: new Date().toISOString(),
};

const INITIAL_DEMO_USER: User = {
  id: 2,
  uid: 'user_demo_02',
  email: 'user@manusherjonno.org',
  name: 'আব্দুর রহিম',
  phone: '০১৭২১২৩৪৫৬৭',
  role: 'USER',
  area: 'মিরপুর ১০, ঢাকা',
  isSuspended: false,
  createdAt: new Date().toISOString(),
};

const INITIAL_DEMO_VOLUNTEER: User = {
  id: 3,
  uid: 'vol_demo_03',
  email: 'volunteer@manusherjonno.org',
  name: 'নুসরাত জাহান',
  phone: '০১৮১২৯৮৭৬৫৪',
  role: 'VOLUNTEER',
  area: 'ধানমন্ডি, ঢাকা',
  isSuspended: false,
  createdAt: new Date().toISOString(),
};

const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: 1,
    creatorId: 2,
    creatorName: 'আব্দুর রহিম',
    title: 'এইচএসসি পরীক্ষার্থীর বই এবং পরীক্ষার ফি এর জন্য আর্থিক ও সামগ্রী সহায়তা',
    description: 'আমার মেয়ের সামনের মাসে এইচএসসি পরীক্ষা শুরু হবে। কিন্তু পরিবারের আর্থিক অনটনের কারণে তার পরীক্ষার টেস্ট পেপার এবং ফি দেওয়া সম্ভব হচ্ছে না।',
    category: 'শিক্ষা সহায়তা',
    urgency: 'জরুরি',
    status: 'সাহায্য প্রয়োজন',
    approxLat: 23.8067,
    approxLng: 90.3685,
    locationName: 'মিরপুর ১০, ঢাকা',
    contactPhone: '০১৭২১২৩৪৫৬৭',
    beneficiaryName: 'সাদিয়া আক্তার',
    beneficiaryAge: '১৭ বছর',
    requiredAssistance: 'বই ও পরীক্ষার ফি',
    volunteerNeeded: true,
    isVerified: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: 2,
    creatorId: 2,
    creatorName: 'আনোয়ার হোসেন',
    title: 'বন্যা উপদ্রুত পরিবারের জন্য শুকনো খাবার এবং বিশুদ্ধ পানি প্রয়োজন',
    description: 'হঠাৎ পাহাড়ি ঢলে আমাদের বসতভিটায় পানি উঠেছে। পরিবারের ৫ জন সদস্যের জন্য চাল, ডাল, চিঁড়া ও খাবার পানি অত্যন্ত জরুরি।',
    category: 'খাবার',
    urgency: 'জরুরি',
    status: 'সহায়তা চলছে',
    approxLat: 23.7509,
    approxLng: 90.3700,
    locationName: 'ধানমন্ডি লেক সংলগ্ন, ঢাকা',
    contactPhone: '০১৮৩১২৩৪৮৮৮',
    beneficiaryName: 'আনোয়ার হোসেন পরিবার',
    beneficiaryAge: 'পারিবারিক',
    requiredAssistance: 'শুকনো খাদ্য ও পানি',
    volunteerNeeded: true,
    isVerified: true,
    assignedVolunteerId: 3,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
  },
  {
    id: 3,
    creatorId: 2,
    creatorName: 'রোকেয়া বেগম',
    title: 'বৃদ্ধার জন্য জরুরি ইনসুলিন ও ডায়াবেটিসের ওষুধ সহায়তা',
    description: 'আমার বয়স ৭০ বছর। স্বামী নেই, এক মেয়ে গৃহপরিচারিকার কাজ করে। প্রতিমাসে ইনসুলিন কিনতে অনেক টাকার প্রয়োজন হয়।',
    category: 'চিকিৎসা সহায়তা',
    urgency: 'স্বাভাবিক',
    status: 'সাহায্য প্রয়োজন',
    approxLat: 23.7104,
    approxLng: 90.4074,
    locationName: 'পুরান ঢাকা, সদরঘাট',
    contactPhone: '০১৬৭৭৮৮৯৯০০',
    beneficiaryName: 'রোকেয়া বেগম',
    beneficiaryAge: '৭০ বছর',
    requiredAssistance: 'ইনসুলিন ও ওষুধ',
    volunteerNeeded: false,
    isVerified: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: 4,
    creatorId: 2,
    creatorName: 'সাইফুল ইসলাম',
    title: 'এতিমখানার শিশুদের জন্য শীতবস্ত্র ও কম্বল বিতরণ',
    description: 'এতিমখানার ৩০ জন ছোট বাচ্চাদের জন্য গরম কাপড় এবং রাতের জন্য কম্বল বিতরণ করা হয়েছে।',
    category: 'পোশাক',
    urgency: 'স্বাভাবিক',
    status: 'সম্পন্ন',
    approxLat: 23.8688,
    approxLng: 90.4005,
    locationName: 'উত্তরা সেক্টর ৭, ঢাকা',
    contactPhone: '০১৭৫৫৫৬৬৭৭৮',
    beneficiaryName: 'নুরানি এতিমখানা',
    beneficiaryAge: '৫-১২ বছর',
    requiredAssistance: 'শীতবস্ত্র ও কম্বল',
    volunteerNeeded: true,
    isVerified: true,
    assignedVolunteerId: 3,
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  }
];

const INITIAL_APPEALS: VolunteerAppeal[] = [
  {
    id: 1,
    requestId: 1,
    message: 'এইচএসসি পরীক্ষার্থীর বই ও ফি সংগ্রহ ও যাচাই করার জন্য ২ জন উদ্যমী স্বেচ্ছাসেবক প্রয়োজন।',
    area: 'মিরপুর, ঢাকা',
    volunteerCount: 2,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    requestTitle: 'এইচএসসি পরীক্ষার্থীর বই এবং পরীক্ষার ফি এর জন্য আর্থিক ও সামগ্রী সহায়তা',
    requestCategory: 'শিক্ষা সহায়তা',
    requestUrgency: 'জরুরি',
  },
  {
    id: 2,
    requestId: 2,
    message: 'ত্রাণ প্যাকেজিং ও বিতরণে সরাসরি অংশ নিতে ৩ জন স্বেচ্ছাসেবী প্রয়োজন।',
    area: 'ধানমন্ডি, ঢাকা',
    volunteerCount: 3,
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    requestTitle: 'বন্যা উপদ্রুত পরিবারের জন্য শুকনো খাবার এবং বিশুদ্ধ পানি প্রয়োজন',
    requestCategory: 'খাবার',
    requestUrgency: 'জরুরি',
  }
];

function getLocal<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(`mj_local_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`mj_local_${key}`, JSON.stringify(val));
  } catch {}
}

export const localStore = {
  getUsers: (): User[] => {
    return getLocal<User[]>('users', [INITIAL_ADMIN, INITIAL_DEMO_USER, INITIAL_DEMO_VOLUNTEER]);
  },
  saveUsers: (users: User[]) => setLocal('users', users),

  getCategories: (): HelpCategory[] => {
    return getLocal<HelpCategory[]>('categories', INITIAL_CATEGORIES);
  },
  saveCategories: (cats: HelpCategory[]) => setLocal('categories', cats),

  getRequests: (): HelpRequest[] => {
    return getLocal<HelpRequest[]>('requests', INITIAL_REQUESTS);
  },
  saveRequests: (reqs: HelpRequest[]) => setLocal('requests', reqs),

  getAppeals: (): VolunteerAppeal[] => {
    return getLocal<VolunteerAppeal[]>('appeals', INITIAL_APPEALS);
  },
  saveAppeals: (apps: VolunteerAppeal[]) => setLocal('appeals', apps),

  getNotifications: (): NotificationItem[] => {
    return getLocal<NotificationItem[]>('notifications', [
      {
        id: 1,
        userId: 2,
        title: 'স্বেচ্ছাসেবক যুক্ত হয়েছেন',
        message: 'আপনার "বন্যা উপদ্রুত পরিবারের খাবার সহায়তা" আবেদনে একজন স্বেচ্ছাসেবক যুক্ত হয়েছেন।',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        userId: 1,
        title: 'নতুন মানবিক আবেদন',
        message: 'মিরপুর এলাকা থেকে নতুন একটি জরুরি শিক্ষা সহায়তার আবেদন জমা পড়েছে।',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      }
    ]);
  },
  saveNotifications: (notes: NotificationItem[]) => setLocal('notifications', notes),

  getReports: (): ReportItem[] => {
    return getLocal<ReportItem[]>('reports', [
      {
        id: 1,
        requestId: 3,
        reporterId: 2,
        reporterName: 'আব্দুর রহিম',
        requestTitle: 'বৃদ্ধার জন্য জরুরি ইনসুলিন ও ডায়াবেটিসের ওষুধ সহায়তা',
        reason: 'ভুল যোগাযোগের ঠিকানা প্রদান করা হয়েছিল, সংশোধন প্রয়োজন।',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      }
    ]);
  },
  saveReports: (reps: ReportItem[]) => setLocal('reports', reps),

  getSavedRequests: (userId: number): SavedRequest[] => {
    const all = getLocal<SavedRequest[]>('saved_requests', []);
    return all.filter((s) => s.userId === userId);
  },
  saveSavedRequests: (saved: SavedRequest[]) => setLocal('saved_requests', saved),

  getAuditLogs: (): AdminAuditLog[] => {
    return getLocal<AdminAuditLog[]>('audit_logs', [
      {
        id: 1,
        action: 'APPROVE_REQUEST',
        targetType: 'REQUEST',
        targetId: 1,
        details: 'আবেদন #১ ভেরিফাই ও অনুমোদন করা হয়েছে।',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ]);
  },
  addAuditLog: (action: string, targetType: string, targetId: number, details: string) => {
    const logs = localStore.getAuditLogs();
    const newLog: AdminAuditLog = {
      id: Date.now(),
      action,
      targetType,
      targetId,
      details,
      createdAt: new Date().toISOString(),
    };
    setLocal('audit_logs', [newLog, ...logs]);
  },

  // Auth Operations
  login: (email: string, pass: string): { message: string; token: string; user: User } => {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Admin login check
    const isAdmin =
      cleanEmail === ADMIN_EMAIL ||
      cleanEmail === 'admin@gmail.com' ||
      cleanEmail === 'admin@manusherjonno.org' ||
      cleanEmail.includes('admin');

    const cleanPass = pass.trim();
    const isCorrectAdminPass =
      cleanPass === ADMIN_PASSWORD ||
      cleanPass === 'pass123456' ||
      cleanPass === '123456' ||
      cleanPass === 'admin' ||
      cleanPass === 'admin123' ||
      cleanPass === 'admin123456' ||
      cleanPass === 'admin@gmail.com' ||
      cleanPass === 'admin@mail.com' ||
      cleanPass === 'Admin@MJ2026!Protected';

    if (isAdmin) {
      if (isCorrectAdminPass) {
        const token = `mock_token_admin_${Date.now()}`;
        return {
          message: 'অ্যাডমিন প্যানেলে স্বাগতম!',
          token,
          user: INITIAL_ADMIN,
        };
      } else {
        throw new Error('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
      }
    }

    // 2. Regular / Volunteer login
    const users = localStore.getUsers();
    const user = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (!user) {
      const newUser: User = {
        id: Date.now(),
        uid: `user_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        phone: '০১৭০০০০০০০০',
        role: 'USER',
        area: 'ঢাকা',
        isSuspended: false,
        createdAt: new Date().toISOString(),
      };
      localStore.saveUsers([...users, newUser]);
      return {
        message: 'লগইন সফল হয়েছে!',
        token: `mock_token_${newUser.id}`,
        user: newUser,
      };
    }

    if (user.isSuspended) {
      throw new Error('নিরাপত্তাজনিত কারণে আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে।');
    }

    return {
      message: 'লগইন সফল হয়েছে!',
      token: `mock_token_${user.id}`,
      user,
    };
  },

  adminLogin: (email: string, pass: string): { message: string; token: string; user: User } => {
    const cleanEmail = email.toLowerCase().trim();
    const isAdmin =
      cleanEmail === ADMIN_EMAIL ||
      cleanEmail === 'admin@gmail.com' ||
      cleanEmail === 'admin@manusherjonno.org' ||
      cleanEmail.includes('admin');

    const cleanPass = pass.trim();
    const isCorrectAdminPass =
      cleanPass === ADMIN_PASSWORD ||
      cleanPass === 'pass123456' ||
      cleanPass === '123456' ||
      cleanPass === 'admin' ||
      cleanPass === 'admin123' ||
      cleanPass === 'admin123456' ||
      cleanPass === 'admin@gmail.com' ||
      cleanPass === 'admin@mail.com' ||
      cleanPass === 'Admin@MJ2026!Protected';

    if (!isAdmin || !isCorrectAdminPass) {
      throw new Error('ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
    }

    return {
      message: 'অ্যাডমিন প্যানেলে স্বাগতম!',
      token: `mock_token_admin_${Date.now()}`,
      user: INITIAL_ADMIN,
    };
  },

  demoLogin: (role: 'USER' | 'VOLUNTEER' | 'ADMIN'): { message: string; token: string; user: User } => {
    if (role === 'ADMIN') {
      return {
        message: 'অ্যাডমিন হিসেবে ডেমো লগইন সফল!',
        token: `mock_token_admin_${Date.now()}`,
        user: INITIAL_ADMIN,
      };
    }
    if (role === 'VOLUNTEER') {
      return {
        message: 'নুসরাত জাহান (স্বেচ্ছাসেবক) হিসেবে ডেমো লগইন সফল!',
        token: `mock_token_vol_${Date.now()}`,
        user: INITIAL_DEMO_VOLUNTEER,
      };
    }
    return {
      message: 'আব্দুর রহিম হিসেবে ডেমো লগইন সফল!',
      token: `mock_token_user_${Date.now()}`,
      user: INITIAL_DEMO_USER,
    };
  },

  registerUser: (data: any): { message: string; token: string; user: User } => {
    const users = localStore.getUsers();
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const existing = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      throw new Error('এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।');
    }

    const newUser: User = {
      id: Date.now(),
      uid: `user_${Date.now()}`,
      email: cleanEmail,
      name: data.name || 'ব্যবহারকারী',
      phone: data.phone || '',
      area: data.area || 'ঢাকা',
      avatar: data.avatar || '',
      role: 'USER',
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    localStore.saveUsers([...users, newUser]);
    return {
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
      token: `mock_token_${newUser.id}`,
      user: newUser,
    };
  },

  registerVolunteer: (data: any): { message: string; token: string; user: User } => {
    const users = localStore.getUsers();
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const existing = users.find((u) => u.email.toLowerCase().trim() === cleanEmail);

    if (existing) {
      throw new Error('এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে।');
    }

    const newVol: User = {
      id: Date.now(),
      uid: `vol_${Date.now()}`,
      email: cleanEmail,
      name: data.name || 'স্বেচ্ছাসেবক',
      phone: data.phone || '',
      area: data.area || 'ঢাকা',
      avatar: data.avatar || '',
      role: 'VOLUNTEER',
      isSuspended: false,
      createdAt: new Date().toISOString(),
    };

    localStore.saveUsers([...users, newVol]);
    return {
      message: 'স্বেচ্ছাসেবক হিসেবে রেজিস্ট্রেশন সফল হয়েছে!',
      token: `mock_token_${newVol.id}`,
      user: newVol,
    };
  },
};
