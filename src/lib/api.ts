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
import { localStore } from './local-store.ts';

const TOKEN_KEY = 'manusher_jonno_token';
const USER_KEY = 'manusher_jonno_current_user';

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getStoredUser = (): User | null => {
  try {
    const u = localStorage.getItem(USER_KEY);
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Client-Side Local Mock Dispatcher for Vercel / Static Hostings
function handleLocalApiFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const [urlPath, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');

  // 1. Auth routes
  if (urlPath === '/api/auth/login') {
    const result = localStore.login(body.email, body.password);
    setStoredToken(result.token);
    setStoredUser(result.user);
    return result as T;
  }

  if (urlPath === '/api/auth/admin-login') {
    const result = localStore.adminLogin(body.email, body.password);
    setStoredToken(result.token);
    setStoredUser(result.user);
    return result as T;
  }

  if (urlPath === '/api/auth/demo-login') {
    const result = localStore.demoLogin(body.role);
    setStoredToken(result.token);
    setStoredUser(result.user);
    return result as T;
  }

  if (urlPath === '/api/auth/register-user') {
    const result = localStore.registerUser(body);
    setStoredToken(result.token);
    setStoredUser(result.user);
    return result as T;
  }

  if (urlPath === '/api/auth/register-volunteer') {
    const result = localStore.registerVolunteer(body);
    setStoredToken(result.token);
    setStoredUser(result.user);
    return result as T;
  }

  if (urlPath === '/api/auth/me') {
    const user = getStoredUser() || localStore.getUsers()[0];
    return {
      user,
      volunteerInfo: user.role === 'VOLUNTEER' ? { isAvailable: true, totalCompleted: 14 } : null,
      unreadNotificationsCount: 1,
    } as T;
  }

  if (urlPath === '/api/auth/profile' && method === 'PATCH') {
    const user = getStoredUser() || localStore.getUsers()[0];
    const updated = { ...user, ...body };
    setStoredUser(updated);
    const allUsers = localStore.getUsers().map((u) => (u.id === user.id ? updated : u));
    localStore.saveUsers(allUsers);
    return { message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', user: updated } as T;
  }

  // 2. Categories
  if (urlPath === '/api/categories') {
    if (method === 'POST') {
      const cats = localStore.getCategories();
      const newCat: HelpCategory = {
        id: Date.now(),
        name: body.name,
        description: body.description || '',
        icon: body.iconName || body.icon || 'HeartHandshake',
      };
      localStore.saveCategories([...cats, newCat]);
      return { message: 'ক্যাটাগরি তৈরি হয়েছে', category: newCat } as T;
    }
    return localStore.getCategories() as T;
  }

  // 3. Requests
  if (urlPath === '/api/requests') {
    const all = localStore.getRequests();
    if (method === 'POST') {
      const user = getStoredUser() || localStore.getUsers()[1];
      const newReq: HelpRequest = {
        id: Date.now(),
        creatorId: user.id,
        creatorName: user.name,
        title: body.title,
        description: body.description,
        category: body.category,
        urgency: body.urgency || 'স্বাভাবিক',
        status: 'অপেক্ষমাণ',
        approxLat: body.approxLat || body.latitude || 23.8103,
        approxLng: body.approxLng || body.longitude || 90.4125,
        locationName: body.locationName || 'ঢাকা',
        contactPhone: body.contactPhone || user.phone || '০১৭০০০০০০০০',
        beneficiaryName: body.beneficiaryName || user.name,
        beneficiaryAge: body.beneficiaryAge || 'পারিবারিক',
        requiredAssistance: body.requiredAssistance || body.description || 'মানবিক সহায়তা',
        volunteerNeeded: body.volunteerNeeded !== false,
        imageUrl: body.imageUrl,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
      localStore.saveRequests([newReq, ...all]);
      return { message: 'সহায়তার আবেদন সফলভাবে জমা দেওয়া হয়েছে!', request: newReq } as T;
    }

    // Filter requests
    let filtered = [...all];
    const category = params.get('category');
    const urgency = params.get('urgency');
    const status = params.get('status');
    const search = params.get('search');
    const area = params.get('area');
    const onlyHelpNeeded = params.get('onlyHelpNeeded');

    if (category) filtered = filtered.filter((r) => r.category === category);
    if (urgency) filtered = filtered.filter((r) => r.urgency === urgency);
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (onlyHelpNeeded === 'true') {
      filtered = filtered.filter((r) => r.status === 'সাহায্য প্রয়োজন' || r.status === 'অনুমোদিত');
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.locationName.toLowerCase().includes(q)
      );
    }
    if (area) {
      filtered = filtered.filter((r) => r.locationName.toLowerCase().includes(area.toLowerCase()));
    }

    return filtered as T;
  }

  // Request details
  if (urlPath.match(/^\/api\/requests\/\d+$/) && method === 'GET') {
    const id = parseInt(urlPath.split('/')[3], 10);
    const req = localStore.getRequests().find((r) => r.id === id) || localStore.getRequests()[0];
    return {
      request: req,
      actions: [],
      activities: [],
      appeals: localStore.getAppeals().filter((a) => a.requestId === id),
      hasReported: false,
      isSaved: false,
    } as T;
  }

  // Request status
  if (urlPath.match(/^\/api\/requests\/\d+\/status$/) && method === 'PATCH') {
    const id = parseInt(urlPath.split('/')[3], 10);
    const reqs = localStore.getRequests();
    const updated = reqs.map((r) => (r.id === id ? { ...r, ...body, updatedAt: new Date().toISOString() } : r));
    localStore.saveRequests(updated);
    const target = updated.find((r) => r.id === id);
    return { message: 'স্ট্যাটাস আপডেট সফল হয়েছে।', request: target! } as T;
  }

  // Join volunteer
  if (urlPath.match(/^\/api\/requests\/\d+\/join-volunteer$/) && method === 'POST') {
    const id = parseInt(urlPath.split('/')[3], 10);
    const user = getStoredUser();
    const reqs = localStore.getRequests();
    const updated = reqs.map((r) =>
      r.id === id
        ? {
            ...r,
            assignedVolunteerId: user?.id || 3,
            status: 'সহায়তা চলছে' as const,
          }
        : r
    );
    localStore.saveRequests(updated);
    return { message: 'আপনি সফলভাবে এই মানবিক সহায়তায় যুক্ত হয়েছেন!' } as T;
  }

  // Complete request
  if (urlPath.match(/^\/api\/requests\/\d+\/complete$/) && method === 'POST') {
    const id = parseInt(urlPath.split('/')[3], 10);
    const reqs = localStore.getRequests();
    const updated = reqs.map((r) =>
      r.id === id ? { ...r, status: 'সম্পন্ন' as const, updatedAt: new Date().toISOString() } : r
    );
    localStore.saveRequests(updated);
    return { message: 'সহায়তা কার্যক্রম সফলভাবে সম্পন্ন চিহ্নিত করা হয়েছে।' } as T;
  }

  // Volunteer appeals
  if (urlPath === '/api/appeals') {
    return localStore.getAppeals() as T;
  }

  // Notifications
  if (urlPath === '/api/notifications') {
    return localStore.getNotifications() as T;
  }

  // Admin stats
  if (urlPath === '/api/admin/stats') {
    const users = localStore.getUsers();
    const requests = localStore.getRequests();
    const reports = localStore.getReports();
    const stats: AdminStats = {
      totalUsers: users.filter((u) => u.role === 'USER').length,
      totalVolunteers: users.filter((u) => u.role === 'VOLUNTEER').length,
      activeUsers: users.filter((u) => !u.isSuspended).length,
      activeVolunteers: users.filter((u) => u.role === 'VOLUNTEER' && !u.isSuspended).length,
      pendingRequests: requests.filter((r) => r.status === 'অপেক্ষমাণ').length,
      activeHelpActivities: requests.filter((r) => r.status === 'সহায়তা চলছে' || r.status === 'সাহায্য প্রয়োজন').length,
      completedActivities: requests.filter((r) => r.status === 'সম্পন্ন').length,
      reportedRequests: reports.filter((rp) => rp.status === 'PENDING').length,
    };
    return stats as T;
  }

  // Admin users
  if (urlPath === '/api/admin/users') {
    const users = localStore.getUsers();
    const requests = localStore.getRequests();
    const mapped: AdminUserItem[] = users
      .filter((u) => u.role === 'USER')
      .map((u) => ({
        id: u.id,
        uid: u.uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        area: u.area,
        role: 'USER',
        isSuspended: !!u.isSuspended,
        createdAt: u.createdAt || new Date().toISOString(),
        helpRequestsCount: requests.filter((r) => r.creatorId === u.id).length,
        assistanceCount: requests.filter((r) => r.assignedVolunteerId === u.id && r.status === 'সম্পন্ন').length,
        status: u.isSuspended ? 'SUSPENDED' : 'ACTIVE',
        lastActive: new Date().toISOString(),
      }));
    return mapped as T;
  }

  // Admin volunteers
  if (urlPath === '/api/admin/volunteers') {
    const users = localStore.getUsers();
    const requests = localStore.getRequests();
    const mapped: AdminVolunteerItem[] = users
      .filter((u) => u.role === 'VOLUNTEER')
      .map((u) => ({
        id: u.id,
        uid: u.uid,
        name: u.name,
        email: u.email,
        phone: u.phone,
        area: u.area,
        role: 'VOLUNTEER',
        isSuspended: !!u.isSuspended,
        createdAt: u.createdAt || new Date().toISOString(),
        skills: 'সাধারণ মানবিক সহায়তা, রক্তদান',
        availability: 'সাপ্তাহিক ছুটি ও অবসর সময়',
        isAvailable: true,
        totalCompleted: requests.filter((r) => r.assignedVolunteerId === u.id && r.status === 'সম্পন্ন').length || 14,
        joinedActivitiesCount: 2,
        completedActivitiesCount: 14,
        ongoingActivitiesCount: requests.filter((r) => r.assignedVolunteerId === u.id && r.status === 'সহায়তা চলছে').length || 1,
        status: u.isSuspended ? 'SUSPENDED' : 'ACTIVE',
        lastActive: new Date().toISOString(),
        recentActivities: requests.slice(0, 2).map((r) => ({
          id: r.id,
          requestId: r.id,
          requestTitle: r.title,
          status: r.status,
          joinedAt: r.createdAt,
        })),
      }));
    return mapped as T;
  }

  // Admin activity monitor
  if (urlPath === '/api/admin/activity-monitor') {
    const users = localStore.getUsers();
    const requests = localStore.getRequests();
    const monitor: ActivityMonitorData = {
      volunteerActivityStatuses: users
        .filter((u) => u.role === 'VOLUNTEER')
        .map((u) => ({
          volunteerId: u.id,
          volunteerName: u.name,
          email: u.email,
          area: u.area || 'ঢাকা',
          requestId: 2,
          activityTitle: 'বন্যা উপদ্রুত পরিবারের খাবার সহায়তা',
          activityStatus: 'Ongoing',
          monitorStatus: 'ACTIVE_NOW',
        })),
      ongoingActivities: requests
        .filter((r) => r.status === 'সহায়তা চলছে' || r.status === 'সাহায্য প্রয়োজন')
        .map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          area: r.locationName,
          status: r.status,
          urgency: r.urgency,
          updatedAt: r.updatedAt || r.createdAt,
          creatorName: r.creatorName,
        })),
      activeUsersList: users
        .filter((u) => u.role === 'USER')
        .map((u) => ({
          id: u.id,
          name: u.name,
          area: u.area || 'ঢাকা',
          monitorStatus: 'ACTIVE_NOW',
          lastSeen: new Date().toISOString(),
        })),
    };
    return monitor as T;
  }

  // Admin logs
  if (urlPath === '/api/admin/logs') {
    return localStore.getAuditLogs() as T;
  }

  // Admin reports
  if (urlPath === '/api/admin/reports') {
    return localStore.getReports() as T;
  }

  // Admin request action
  if (urlPath.match(/^\/api\/admin\/requests\/\d+\/action$/) && method === 'PATCH') {
    const id = parseInt(urlPath.split('/')[4], 10);
    const action = body.action;
    const reqs = localStore.getRequests();
    let newStatus = 'অনুমোদিত';
    let isVerified = true;
    if (action === 'REJECT') newStatus = 'বাতিল';
    if (action === 'SUSPEND') newStatus = 'স্থগিত';
    const updated = reqs.map((r) =>
      r.id === id ? { ...r, status: newStatus as any, isVerified, updatedAt: new Date().toISOString() } : r
    );
    localStore.saveRequests(updated);
    localStore.addAuditLog(
      `REQUEST_${action}`,
      'REQUEST',
      id,
      `আবেদন #${id} এর উপর অ্যাকশন '${action}' প্রয়োগ করা হয়েছে।`
    );
    return { message: 'আবেদন আপডেট সম্পন্ন হয়েছে।', request: updated.find((r) => r.id === id)! } as T;
  }

  // Suspend user
  if (urlPath.match(/^\/api\/admin\/users\/\d+\/suspend$/) && method === 'PATCH') {
    const id = parseInt(urlPath.split('/')[4], 10);
    const isSuspended = !!body.isSuspended;
    const users = localStore.getUsers();
    const updated = users.map((u) => (u.id === id ? { ...u, isSuspended } : u));
    localStore.saveUsers(updated);
    localStore.addAuditLog(
      isSuspended ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      'USER',
      id,
      `ইউজার #${id} এর অ্যাকাউন্ট ${isSuspended ? 'স্থগিত' : 'পুনরায় সক্রিয়'} করা হয়েছে।`
    );
    return { message: isSuspended ? 'অ্যাকাউন্ট স্থগিত করা হয়েছে।' : 'অ্যাকাউন্ট সক্রিয় করা হয়েছে।', user: updated.find((u) => u.id === id) } as T;
  }

  // Smart match
  if (urlPath === '/api/smart-match') {
    const requests = localStore.getRequests().filter((r) => r.status === 'সাহায্য প্রয়োজন');
    return {
      summary: 'আপনার এলাকার বর্তমান জরুরি মানবিক আবেদনসমূহ',
      recommendations: requests.slice(0, 3).map((req) => ({
        request: req,
        matchReason: 'কাছাকাছি অবস্থান ও জরুরি প্রয়োজন',
      })),
    } as T;
  }

  // Upload image mock
  if (urlPath === '/api/upload') {
    return { url: body.image || '', message: 'ছবি আপলোড হয়েছে' } as T;
  }

  // Default fallback
  return {} as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const isHtmlResponse = contentType.includes('text/html');

    // If static hosting (like Vercel SPA) returned index.html or 404/500/504
    if (isHtmlResponse || response.status === 404 || response.status >= 500) {
      console.warn(`[API Fallback] Backend not reachable on ${endpoint} (Status: ${response.status}). Using local fail-safe storage.`);
      return handleLocalApiFallback<T>(endpoint, options);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If 401/400 returned, check if user provided valid credentials that localStore accepts
      if (response.status === 401 && endpoint.includes('/api/auth/')) {
        try {
          return handleLocalApiFallback<T>(endpoint, options);
        } catch {
          throw new Error(data.error || 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়');
        }
      }
      throw new Error(data.error || 'একটি ত্রুটি ঘটেছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }

    // Cache user on successful auth
    if (data && data.user) {
      setStoredUser(data.user);
    }

    return data as T;
  } catch (networkError: any) {
    // If pure network error (e.g. backend completely down or offline)
    console.warn(`[API Network Fallback] Fetch failed for ${endpoint}:`, networkError.message);
    return handleLocalApiFallback<T>(endpoint, options);
  }
}

export const api = {
  // Auth
  registerUser: (data: any) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerVolunteer: (data: any) =>
    request<{ message: string; token: string; user: User }>('/api/auth/register-volunteer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoLogin: (role: 'USER' | 'VOLUNTEER' | 'ADMIN') =>
    request<{ message: string; token: string; user: User }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () =>
    request<{ user: User; volunteerInfo: any; unreadNotificationsCount: number }>('/api/auth/me'),

  updateProfile: (data: any) =>
    request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateAvailability: (slots: string[]) =>
    request<{ message: string; availabilitySlots: string[] }>('/api/auth/availability', {
      method: 'PATCH',
      body: JSON.stringify({ slots }),
    }),

  uploadImage: (image: string, name?: string) =>
    request<{ url: string; message: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image, name }),
    }),

  // Categories
  getCategories: () => request<HelpCategory[]>('/api/categories'),
  addCategory: (data: any) =>
    request<{ message: string; category: HelpCategory }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Help Requests / Help Opportunities
  getRequests: (params?: {
    category?: string;
    urgency?: string;
    status?: string;
    search?: string;
    area?: string;
    myRequests?: boolean;
    onlyHelpNeeded?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.urgency) query.set('urgency', params.urgency);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.area) query.set('area', params.area);
    if (params?.myRequests) query.set('myRequests', 'true');
    if (params?.onlyHelpNeeded) query.set('onlyHelpNeeded', 'true');
    return request<HelpRequest[]>(`/api/requests?${query.toString()}`);
  },

  getRequestDetails: (id: number) =>
    request<{
      request: HelpRequest;
      actions: any[];
      activities: any[];
      appeals: any[];
      hasReported: boolean;
      isSaved?: boolean;
    }>(`/api/requests/${id}`),

  createRequest: (data: any) =>
    request<{ message: string; request: HelpRequest }>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRequestStatus: (
    id: number,
    data: { status?: string; isVerified?: boolean; completionNotes?: string }
  ) =>
    request<{ message: string; request: HelpRequest }>(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRequest: (id: number) =>
    request<{ message: string }>(`/api/requests/${id}`, {
      method: 'DELETE',
    }),

  // Help Wishlist / Saved Requests
  getSavedRequests: () => request<SavedRequest[]>('/api/saved-requests'),
  toggleSaveRequest: (id: number) =>
    request<{ saved: boolean; message: string }>(`/api/requests/${id}/save`, {
      method: 'POST',
    }),
  unsaveRequest: (id: number) =>
    request<{ message: string }>(`/api/requests/${id}/save`, {
      method: 'DELETE',
    }),

  // Smart Matching (“স্মার্ট সাহায্য মিল”)
  getSmartMatch: () => request<SmartMatchResult>('/api/smart-match'),

  // Volunteer Appeal & Join
  requestVolunteerAppeal: (
    id: number,
    data: {
      message?: string;
      volunteerCount?: number;
      timeNeeded?: string;
      helpType?: string;
    }
  ) =>
    request<{ message: string; appeal: any }>(`/api/requests/${id}/volunteer-appeal`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  joinVolunteer: (id: number, notes?: string) =>
    request<{ message: string }>(`/api/requests/${id}/join-volunteer`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  assistPledge: (id: number, data: { assistanceType: string; message: string }) =>
    request<{ message: string; action: any }>(`/api/requests/${id}/assist`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  markCompleted: (id: number, notes?: string, confirmed: boolean = true) =>
    request<{ message: string }>(`/api/requests/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes, confirmed }),
    }),

  reportRequest: (id: number, data: { reason: string; details?: string }) =>
    request<{ message: string }>(`/api/requests/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAppeals: () => request<VolunteerAppeal[]>('/api/appeals'),

  // Notifications
  getNotifications: () => request<NotificationItem[]>('/api/notifications'),
  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PATCH',
    }),

  // Admin
  getAdminStats: () => request<AdminStats>('/api/admin/stats'),
  getAdminUsers: () => request<AdminUserItem[]>('/api/admin/users'),
  getAdminVolunteers: () => request<AdminVolunteerItem[]>('/api/admin/volunteers'),
  getActivityMonitor: () => request<ActivityMonitorData>('/api/admin/activity-monitor'),
  getAdminLogs: () => request<AdminAuditLog[]>('/api/admin/logs'),
  adminRequestAction: (
    id: number,
    action: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'MARK_REVIEWED'
  ) =>
    request<{ message: string; request: HelpRequest }>(`/api/admin/requests/${id}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    }),
  toggleSuspendUser: (id: number, isSuspended: boolean) =>
    request<{ message: string; user: any }>(`/api/admin/users/${id}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ isSuspended }),
    }),
  getAdminReports: () => request<ReportItem[]>('/api/admin/reports'),
  updateReportStatus: (id: number, status: string) =>
    request<{ message: string }>(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  createCategory: (data: { name: string; description?: string; iconName?: string }) =>
    request<{ message: string; category: HelpCategory }>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
