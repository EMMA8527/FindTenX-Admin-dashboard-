export type AdminRole =
  | "super_admin"
  | "operations"
  | "verification"
  | "moderator"
  | "support"
  | "finance"
  | "marketing";

export type AccountStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "banned"
  | "pending_deletion";

export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "resubmission"
  | "unverified";

export type MembershipType = "free" | "premium";

export type ReportStatus =
  | "new"
  | "under_review"
  | "escalated"
  | "action_required"
  | "resolved"
  | "rejected";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_for_user"
  | "escalated"
  | "resolved"
  | "closed";

export type TransactionStatus =
  | "successful"
  | "pending"
  | "failed"
  | "refunded"
  | "disputed"
  | "cancelled";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  avatar: string;
  mfaEnabled: boolean;
  status: "active" | "inactive";
  lastLoginAt: string;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth: string;
  country: string;
  city: string;
  gender: "female" | "male" | "other";
  avatar: string;
  bio: string;
  interests: string[];
  occupation: string;
  education: string;
  relationshipIntent: string;
  photos: string[];
  registeredAt: string;
  lastActiveAt: string;
  verificationStatus: VerificationStatus;
  membership: MembershipType;
  subscriptionExpiresAt: string | null;
  accountStatus: AccountStatus;
  registrationMethod: string;
  likesSent: number;
  likesReceived: number;
  matches: number;
  conversations: number;
  reportsReceived: number;
  reportsSubmitted: number;
  profileHidden: boolean;
  completeness: number;
}

export interface VerificationSubmission {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: "identity" | "selfie" | "liveness" | "document";
  submittedAt: string;
  status: VerificationStatus;
  priority: "low" | "medium" | "high";
  providerResult: string;
  notes: string;
}

export interface MatchRecord {
  id: string;
  userAId: string;
  userAName: string;
  userAAvatar: string;
  userBId: string;
  userBName: string;
  userBAvatar: string;
  matchedAt: string;
  status: "active" | "unmatched" | "removed";
}

export interface LikeRecord {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  createdAt: string;
  membership: MembershipType;
  country: string;
}

export interface ConversationRecord {
  id: string;
  participants: string[];
  participantNames: string[];
  messageCount: number;
  lastMessageAt: string;
  reported: boolean;
  deliveryErrors: number;
  status: "active" | "archived" | "restricted";
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedId: string;
  reportedName: string;
  category: string;
  explanation: string;
  submittedAt: string;
  priority: "low" | "medium" | "high" | "critical";
  assignedModerator: string | null;
  status: ReportStatus;
  notes: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "monthly" | "annual";
  features: string[];
  trialDays: number;
  available: boolean;
  subscribers: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  planId: string;
  planName: string;
  status: "active" | "expired" | "cancelled" | "past_due";
  startedAt: string;
  renewsAt: string | null;
  provider: string;
}

export interface Transaction {
  id: string;
  userId: string;
  customerName: string;
  provider: string;
  amount: number;
  currency: string;
  date: string;
  type: "subscription" | "boost" | "promotion" | "other";
  status: TransactionStatus;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  category: string;
  audience: string;
  channel: "in_app" | "push" | "email";
  status: "draft" | "scheduled" | "sent" | "failed";
  scheduledAt: string | null;
  sentAt: string | null;
  sent: number;
  delivered: number;
  failed: number;
  read: number;
}

export interface PromoCampaign {
  id: string;
  name: string;
  description: string;
  type: string;
  audience: string;
  startDate: string;
  endDate: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  promoCode: string;
  usageLimit: number;
  usedCount: number;
  status: "draft" | "active" | "ended" | "paused";
  registrations: number;
  conversions: number;
  revenue: number;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignedAgent: string | null;
  createdAt: string;
  status: TicketStatus;
  messages: { id: string; author: string; body: string; at: string; internal: boolean }[];
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: AdminRole;
  action: string;
  target: string;
  result: "success" | "failure" | "denied";
  reason: string;
  ip: string;
  at: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  userName: string;
  userAvatar: string;
  at: string;
  status: string;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timezone: string;
  minAge: number;
  maxDiscoveryAge: number;
  maxDiscoveryDistanceKm: number;
  supportedCountries: string[];
  imageAttachmentLimitMb: number;
  messageRetentionDays: number;
}

export interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalMatches: number;
  totalLikes: number;
  totalConversations: number;
  premiumSubscribers: number;
  totalRevenue: number;
  pendingReports: number;
  suspendedAccounts: number;
  changes: Record<string, number>;
}
