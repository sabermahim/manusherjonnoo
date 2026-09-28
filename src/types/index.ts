export interface User {
  id: number;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'VOLUNTEER' | 'ADMIN';
  avatar?: string;
  area?: string;
  availabilitySlots?: string[];
  helpImpactCount?: number;
  volunteerImpactCount?: number;
  isSuspended?: boolean;
  createdAt: string;
}

export interface VolunteerProfile {
  id: number;
  userId: number;
  skills: string;
  availability: string;
  isAvailable: boolean;
  totalCompleted: number;
  createdAt: string;
}

export interface HelpCategory {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export type RequestStatus =
  | 'অপেক্ষমাণ'
  | 'যাচাই হচ্ছে'
  | 'অনুমোদিত'
  | 'সাহায্য প্রয়োজন'
  | 'সাহায্যকারী পাওয়া গেছে'
  | 'সহায়তা চলছে'
  | 'সম্পন্ন'
  | 'বাতিল'
  | 'স্থগিত';

export type UrgencyLevel = 'জরুরি' | 'মাঝারি' | 'স্বাভাবিক';

export interface HelpRequest {
  id: number;
  category: string;
  title: string;
  description: string;
  beneficiaryName: string;
  beneficiaryAge: string;
  approxLat: number;
  approxLng: number;
  locationName: string;
  urgency: UrgencyLevel;
  requiredAssistance: string;
  additionalInfo?: string;
  educationDetails?: string;
  imageUrl?: string;
  status: RequestStatus;
  isVerified: boolean;
  volunteerNeeded: boolean;
  assignedVolunteerId?: number | null;
  completionNotes?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt?: string;
  creatorId: number;
  creatorName?: string;
  creatorArea?: string;
  isSaved?: boolean;
}

export interface AssistanceAction {
  id: number;
  assistanceType: string;
  message: string;
  createdAt: string;
  helperName: string;
  helperRole: string;
}

export interface VolunteerActivity {
  id: number;
  status: 'JOINED' | 'IN_PROGRESS' | 'COMPLETED' | 'WITHDRAWN';
  notes?: string;
  joinedAt: string;
  completedAt?: string;
  volunteerName: string;
  volunteerId: number;
  volunteerPhone?: string;
}

export interface VolunteerAppeal {
  id: number;
  requestId: number;
  message: string;
  area: string;
  volunteerCount?: number;
  timeNeeded?: string;
  helpType?: string;
  status: 'OPEN' | 'ACCEPTED' | 'CLOSED';
  createdAt: string;
  requestTitle?: string;
  requestCategory?: string;
  requestUrgency?: string;
  title?: string;
  description?: string;
  urgency?: string;
  volunteersNeeded?: number;
  locationName?: string;
}

export interface SavedRequest {
  id: number;
  userId: number;
  requestId: number;
  createdAt: string;
  request: HelpRequest;
}

export interface NotificationItem {
  id: number;
  userId: number;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export type AppNotification = NotificationItem;

export interface ReportItem {
  id: number;
  requestId: number;
  reporterId: number;
  reporterName?: string;
  reporterEmail?: string;
  requestTitle?: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalVolunteers: number;
  activeUsers: number;
  activeVolunteers: number;
  pendingRequests: number;
  activeHelpActivities: number;
  completedActivities: number;
  reportedRequests: number;
}

export interface AdminUserItem {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  area?: string;
  role: 'USER';
  isSuspended: boolean;
  createdAt: string;
  helpRequestsCount: number;
  assistanceCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastActive: string;
}

export interface AdminVolunteerItem {
  id: number;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  area?: string;
  role: 'VOLUNTEER';
  isSuspended: boolean;
  createdAt: string;
  skills?: string;
  availability?: string;
  isAvailable: boolean;
  totalCompleted: number;
  joinedActivitiesCount: number;
  completedActivitiesCount: number;
  ongoingActivitiesCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastActive: string;
  recentActivities: Array<{
    id: number;
    requestId: number;
    requestTitle?: string;
    status: string;
    joinedAt: string;
  }>;
}

export interface ActivityMonitorData {
  volunteerActivityStatuses: Array<{
    volunteerId: number;
    volunteerName: string;
    email: string;
    area: string;
    requestId: number | null;
    activityTitle: string;
    activityStatus: 'Ongoing' | 'Completed' | 'Inactive';
    monitorStatus: 'ACTIVE_NOW' | 'RECENTLY_ACTIVE' | 'INACTIVE';
  }>;
  ongoingActivities: Array<{
    id: number;
    title: string;
    category: string;
    area: string;
    status: string;
    urgency: string;
    updatedAt: string;
    creatorName?: string;
  }>;
  activeUsersList: Array<{
    id: number;
    name: string;
    area: string;
    monitorStatus: 'ACTIVE_NOW' | 'RECENTLY_ACTIVE' | 'INACTIVE';
    lastSeen: string;
  }>;
}

export interface AdminAuditLog {
  id: number;
  action: string;
  targetType: string;
  targetId: number;
  details: string;
  createdAt: string;
}

export interface SmartMatchResult {
  summary: string;
  recommendations: Array<{
    request: HelpRequest;
    matchReason: string;
  }>;
}
