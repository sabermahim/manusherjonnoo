import { relations } from 'drizzle-orm';
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or system UID
  email: text('email').notNull(),
  name: text('name').notNull(),
  phone: text('phone').default(''),
  role: text('role').notNull().default('USER'), // 'USER' | 'VOLUNTEER' | 'ADMIN'
  avatar: text('avatar').default(''),
  area: text('area').default(''),
  availabilitySlots: text('availability_slots').default('[]'), // e.g. ["সকাল", "বিকেল"]
  helpImpactCount: integer('help_impact_count').default(0).notNull(),
  volunteerImpactCount: integer('volunteer_impact_count').default(0).notNull(),
  isSuspended: boolean('is_suspended').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Volunteer profile details
export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  skills: text('skills').notNull().default(''), // e.g. শিক্ষা সহায়তা, চিকিৎসা সেবা, রক্তদান
  availability: text('availability').notNull().default('যেকোনো সময়'), // e.g. সাপ্তাহিক ছুটি, প্রতিদিন বিকাল
  isAvailable: boolean('is_available').default(true).notNull(),
  totalCompleted: integer('total_completed').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Help Categories table
export const helpCategories = pgTable('help_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  icon: text('icon').notNull().default('HeartHandshake'),
  description: text('description').default(''),
});

// Help Requests table
export const helpRequests = pgTable('help_requests', {
  id: serial('id').primaryKey(),
  creatorId: integer('creator_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  beneficiaryName: text('beneficiary_name').default(''),
  beneficiaryAge: text('beneficiary_age').default(''),
  approxLat: doublePrecision('approx_lat').notNull().default(23.8103),
  approxLng: doublePrecision('approx_lng').notNull().default(90.4125),
  locationName: text('location_name').notNull().default('ঢাকা'),
  urgency: text('urgency').notNull().default('স্বাভাবিক'), // 'জরুরি' | 'মাঝারি' | 'স্বাভাবিক'
  requiredAssistance: text('required_assistance').notNull(),
  additionalInfo: text('additional_info').default(''),
  educationDetails: text('education_details').default(''),
  imageUrl: text('image_url').default(''),
  status: text('status').notNull().default('অপেক্ষমাণ'), // 'অপেক্ষমাণ' | 'যাচাই হচ্ছে' | 'অনুমোদিত' | 'সাহায্য প্রয়োজন' | 'স্বেচ্ছাসেবক পাওয়া গেছে' | 'সহায়তা চলছে' | 'সম্পন্ন' | 'বাতিল'
  isVerified: boolean('is_verified').default(false).notNull(),
  volunteerNeeded: boolean('volunteer_needed').default(false).notNull(),
  assignedVolunteerId: integer('assigned_volunteer_id').references(() => users.id),
  completionNotes: text('completion_notes').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Volunteer Appeals
export const volunteerAppeals = pgTable('volunteer_appeals', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id')
    .references(() => helpRequests.id, { onDelete: 'cascade' })
    .notNull(),
  requesterId: integer('requester_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  message: text('message').notNull(),
  area: text('area').notNull(),
  volunteerCount: integer('volunteer_count').default(1).notNull(),
  timeNeeded: text('time_needed').default('তাৎক্ষণিক / সুবিধাজনক সময়'),
  helpType: text('help_type').default('মাঠপর্যায়ে সরাসরি সহায়তা'),
  status: text('status').notNull().default('OPEN'), // 'OPEN' | 'ACCEPTED' | 'CLOSED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Saved Requests (Help Wishlist / আমার সংরক্ষিত সুযোগ)
export const savedRequests = pgTable('saved_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  requestId: integer('request_id')
    .references(() => helpRequests.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Volunteer Activities (Joined/Completed)
export const volunteerActivities = pgTable('volunteer_activities', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id')
    .references(() => helpRequests.id, { onDelete: 'cascade' })
    .notNull(),
  volunteerId: integer('volunteer_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  status: text('status').notNull().default('JOINED'), // 'JOINED' | 'IN_PROGRESS' | 'COMPLETED' | 'WITHDRAWN'
  notes: text('notes').default(''),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Assistance Actions (Direct help pledge / contributed)
export const assistanceActions = pgTable('assistance_actions', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id')
    .references(() => helpRequests.id, { onDelete: 'cascade' })
    .notNull(),
  helperId: integer('helper_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  assistanceType: text('assistance_type').notNull().default('সরাসরি সহায়তা'),
  message: text('message').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link').default(''),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports (Abuse prevention & safety)
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  requestId: integer('request_id')
    .references(() => helpRequests.id, { onDelete: 'cascade' })
    .notNull(),
  reporterId: integer('reporter_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reason: text('reason').notNull(),
  details: text('details').default(''),
  status: text('status').notNull().default('PENDING'), // 'PENDING' | 'REVIEWED' | 'DISMISSED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin Logs
export const adminLogs = pgTable('admin_logs', {
  id: serial('id').primaryKey(),
  action: text('action').notNull(),
  targetType: text('target_type').notNull(),
  targetId: integer('target_id').default(0),
  details: text('details').default(''),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  volunteerProfile: one(volunteers, {
    fields: [users.id],
    references: [volunteers.userId],
  }),
  createdRequests: many(helpRequests, { relationName: 'creator' }),
  assignedRequests: many(helpRequests, { relationName: 'volunteer' }),
  volunteerActivities: many(volunteerActivities),
  assistanceActions: many(assistanceActions),
  notifications: many(notifications),
  savedRequests: many(savedRequests),
}));

export const volunteersRelations = relations(volunteers, ({ one }) => ({
  user: one(users, {
    fields: [volunteers.userId],
    references: [users.id],
  }),
}));

export const helpRequestsRelations = relations(helpRequests, ({ one, many }) => ({
  creator: one(users, {
    fields: [helpRequests.creatorId],
    references: [users.id],
    relationName: 'creator',
  }),
  assignedVolunteer: one(users, {
    fields: [helpRequests.assignedVolunteerId],
    references: [users.id],
    relationName: 'volunteer',
  }),
  volunteerAppeals: many(volunteerAppeals),
  volunteerActivities: many(volunteerActivities),
  assistanceActions: many(assistanceActions),
  savedRequests: many(savedRequests),
  reports: many(reports),
}));

export const volunteerActivitiesRelations = relations(volunteerActivities, ({ one }) => ({
  request: one(helpRequests, {
    fields: [volunteerActivities.requestId],
    references: [helpRequests.id],
  }),
  volunteer: one(users, {
    fields: [volunteerActivities.volunteerId],
    references: [users.id],
  }),
}));

export const assistanceActionsRelations = relations(assistanceActions, ({ one }) => ({
  request: one(helpRequests, {
    fields: [assistanceActions.requestId],
    references: [helpRequests.id],
  }),
  helper: one(users, {
    fields: [assistanceActions.helperId],
    references: [users.id],
  }),
}));
