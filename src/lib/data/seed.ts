import type {
  ActivityItem,
  AdminUser,
  AuditLog,
  ConversationRecord,
  LikeRecord,
  MatchRecord,
  NotificationCampaign,
  OverviewMetrics,
  PlatformSettings,
  PlatformUser,
  PromoCampaign,
  ReportRecord,
  SubscriptionPlan,
  SupportTicket,
  Transaction,
  UserSubscription,
  VerificationSubmission,
} from "@/lib/types";

export const admins: AdminUser[] = [
  {
    id: "adm_001",
    email: "emma@findtenx.com",
    name: "Emma Paul",
    role: "super_admin",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=EmmaPaul",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-06T09:12:00Z",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "adm_002",
    email: "james@findtenx.com",
    name: "James Okoro",
    role: "operations",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JamesOkoro",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-05T16:40:00Z",
    createdAt: "2024-03-02T10:00:00Z",
  },
  {
    id: "adm_003",
    email: "amina@findtenx.com",
    name: "Amina Yusuf",
    role: "verification",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AminaYusuf",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-06T08:05:00Z",
    createdAt: "2024-05-18T10:00:00Z",
  },
  {
    id: "adm_004",
    email: "noah@findtenx.com",
    name: "Noah Mensah",
    role: "moderator",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=NoahMensah",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-06T07:50:00Z",
    createdAt: "2024-06-01T10:00:00Z",
  },
  {
    id: "adm_005",
    email: "sofia@findtenx.com",
    name: "Sofia Adeyemi",
    role: "support",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaAdeyemi",
    mfaEnabled: false,
    status: "active",
    lastLoginAt: "2026-11-06T10:01:00Z",
    createdAt: "2024-07-12T10:00:00Z",
  },
  {
    id: "adm_006",
    email: "daniel@findtenx.com",
    name: "Daniel Chen",
    role: "finance",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DanielChen",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-04T14:22:00Z",
    createdAt: "2024-08-20T10:00:00Z",
  },
  {
    id: "adm_007",
    email: "lara@findtenx.com",
    name: "Lara Nwosu",
    role: "marketing",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=LaraNwosu",
    mfaEnabled: true,
    status: "active",
    lastLoginAt: "2026-11-05T11:18:00Z",
    createdAt: "2024-09-05T10:00:00Z",
  },
];

const cities = [
  ["Nigeria", "Lagos"],
  ["Nigeria", "Abuja"],
  ["Ghana", "Accra"],
  ["Kenya", "Nairobi"],
  ["South Africa", "Cape Town"],
  ["United Kingdom", "London"],
  ["United States", "New York"],
  ["Canada", "Toronto"],
];

const firstNames = [
  "Sandra",
  "David",
  "Lydia",
  "John",
  "Amara",
  "Tunde",
  "Chioma",
  "Kwame",
  "Fatima",
  "Michael",
  "Grace",
  "Ibrahim",
  "Ngozi",
  "Ethan",
  "Zainab",
  "Oliver",
  "Ada",
  "Samuel",
  "Blessing",
  "Victor",
  "Halima",
  "Peter",
  "Ruth",
  "Kofi",
];

const lastNames = [
  "M.",
  "K.",
  "O.",
  "E.",
  "Ade",
  "Bello",
  "Owusu",
  "Kamau",
  "Dube",
  "Smith",
  "Johnson",
  "Ali",
  "Okeke",
  "Brown",
  "Hassan",
  "Williams",
  "Eze",
  "Carter",
  "Ibrahim",
  "Mensah",
];

function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

function buildUsers(): PlatformUser[] {
  return Array.from({ length: 48 }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[i % lastNames.length];
    const fullName = `${first} ${last}`;
    const [country, city] = cities[i % cities.length];
    const gender = i % 17 === 0 ? "other" : i % 2 === 0 ? "female" : "male";
    const verificationStatuses = [
      "verified",
      "verified",
      "verified",
      "pending",
      "rejected",
      "resubmission",
      "unverified",
    ] as const;
    const accountStatuses = [
      "active",
      "active",
      "active",
      "inactive",
      "suspended",
      "banned",
      "pending_deletion",
    ] as const;
    const membership = i % 4 === 0 ? "premium" : "free";
    const age = 22 + (i % 18);
    return {
      id: `usr_${String(1000 + i)}`,
      fullName,
      email: `${first.toLowerCase()}.${last.replace(".", "").toLowerCase()}${i}@mail.findtenx.dev`,
      phone: `+23480${String(10000000 + i * 137).slice(0, 8)}`,
      age,
      dateOfBirth: `${2004 - (age - 22)}-${String((i % 12) + 1).padStart(2, "0")}-15`,
      country,
      city,
      gender,
      avatar: avatar(fullName),
      bio:
        i % 3 === 0
          ? "Looking for meaningful connection, great conversations, and weekend adventures."
          : "Coffee lover, travel enthusiast, and always up for trying a new restaurant.",
      interests: ["Travel", "Music", "Fitness", "Food", "Art", "Tech"].slice(0, 3 + (i % 3)),
      occupation: ["Product Designer", "Software Engineer", "Nurse", "Entrepreneur", "Teacher"][
        i % 5
      ],
      education: ["BSc Computer Science", "MBA", "BA Communications", "MSc Data Science"][i % 4],
      relationshipIntent: ["Long-term", "Marriage", "Dating", "Friendship first"][i % 4],
      photos: [avatar(`${fullName}-1`), avatar(`${fullName}-2`), avatar(`${fullName}-3`)],
      registeredAt: new Date(Date.UTC(2026, 9, 7 + (i % 30), 8 + (i % 10))).toISOString(),
      lastActiveAt: new Date(Date.UTC(2026, 10, 1 + (i % 6), 9 + (i % 12))).toISOString(),
      verificationStatus: verificationStatuses[i % verificationStatuses.length],
      membership,
      subscriptionExpiresAt:
        membership === "premium"
          ? new Date(Date.UTC(2026, 11, 15 + (i % 10))).toISOString()
          : null,
      accountStatus: accountStatuses[i % accountStatuses.length],
      registrationMethod: i % 3 === 0 ? "Apple" : i % 3 === 1 ? "Google" : "Email",
      likesSent: 40 + i * 17,
      likesReceived: 28 + i * 13,
      matches: 5 + (i % 20),
      conversations: 3 + (i % 15),
      reportsReceived: i % 9 === 0 ? 1 + (i % 3) : 0,
      reportsSubmitted: i % 7 === 0 ? 1 : 0,
      profileHidden: i % 11 === 0,
      completeness: 55 + (i % 45),
    };
  });
}

export const users = buildUsers();

/** Legacy seed snapshot — never used for dashboard KPIs (always table-computed or Core). */
export const overviewMetrics: OverviewMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  newRegistrations: 0,
  verifiedUsers: 0,
  pendingVerifications: 0,
  totalMatches: 0,
  totalLikes: 0,
  totalConversations: 0,
  premiumSubscribers: 0,
  totalRevenue: 0,
  pendingReports: 0,
  suspendedAccounts: 0,
  changes: {},
};

export const userGrowth = Array.from({ length: 31 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 9, 7 + i));
  return {
    date: day.toISOString().slice(0, 10),
    label: day.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    users: 420000 + i * 1950 + (i % 5) * 420,
    registrations: 220 + i * 8 + (i % 4) * 15,
  };
});

export const engagementSeries = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  likes: 140000 + i * 12000 + (i % 3) * 8000,
  matches: 22000 + i * 2800 + (i % 4) * 1200,
}));

export const revenueSeries = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
  subscriptions: 62000 + i * 4200,
  boosts: 4200 + i * 380,
  other: 1800 + i * 120,
}));

export const recentActivity: ActivityItem[] = [
  {
    id: "act_1",
    type: "New Registration",
    description: "Completed email signup and profile setup",
    userName: "Sandra M.",
    userAvatar: avatar("Sandra M"),
    at: "2026-11-06T09:24:00Z",
    status: "completed",
  },
  {
    id: "act_2",
    type: "Subscription activated",
    description: "Premium monthly plan activated via App Store",
    userName: "David K.",
    userAvatar: avatar("David K"),
    at: "2026-11-06T09:11:00Z",
    status: "completed",
  },
  {
    id: "act_3",
    type: "User account verified",
    description: "Identity + liveness checks approved",
    userName: "Lydia O.",
    userAvatar: avatar("Lydia O"),
    at: "2026-11-06T08:58:00Z",
    status: "verified",
  },
  {
    id: "act_4",
    type: "New mutual match",
    description: "Mutual like created a new conversation",
    userName: "John E.",
    userAvatar: avatar("John E"),
    at: "2026-11-06T08:42:00Z",
    status: "active",
  },
  {
    id: "act_5",
    type: "Report submitted",
    description: "Harassment report filed against another user",
    userName: "Amara Ade",
    userAvatar: avatar("Amara Ade"),
    at: "2026-11-06T08:20:00Z",
    status: "new",
  },
  {
    id: "act_6",
    type: "Account suspended",
    description: "Temporary suspension after repeated violations",
    userName: "Victor Mensah",
    userAvatar: avatar("Victor Mensah"),
    at: "2026-11-06T07:55:00Z",
    status: "suspended",
  },
];

export const verifications: VerificationSubmission[] = users
  .filter((u) => ["pending", "rejected", "resubmission"].includes(u.verificationStatus))
  .map((u, i) => ({
    id: `ver_${String(2000 + i)}`,
    userId: u.id,
    userName: u.fullName,
    userAvatar: u.avatar,
    type: (["identity", "selfie", "liveness", "document"] as const)[i % 4],
    submittedAt: u.registeredAt,
    status: u.verificationStatus,
    priority: (["high", "medium", "low"] as const)[i % 3],
    providerResult:
      u.verificationStatus === "pending"
        ? "Awaiting reviewer decision"
        : u.verificationStatus === "rejected"
          ? "Document mismatch"
          : "Image quality insufficient",
    notes: "",
  }));

export const matches: MatchRecord[] = Array.from({ length: 24 }, (_, i) => {
  const a = users[i];
  const b = users[(i + 7) % users.length];
  return {
    id: `mtc_${3000 + i}`,
    userAId: a.id,
    userAName: a.fullName,
    userAAvatar: a.avatar,
    userBId: b.id,
    userBName: b.fullName,
    userBAvatar: b.avatar,
    matchedAt: new Date(Date.UTC(2026, 9, 10 + (i % 25), 12)).toISOString(),
    status: i % 10 === 0 ? "unmatched" : "active",
  };
});

export const likes: LikeRecord[] = Array.from({ length: 40 }, (_, i) => {
  const from = users[i % users.length];
  const to = users[(i + 11) % users.length];
  return {
    id: `like_${4000 + i}`,
    fromUserId: from.id,
    fromUserName: from.fullName,
    toUserId: to.id,
    toUserName: to.fullName,
    createdAt: new Date(Date.UTC(2026, 9, 8 + (i % 28), 10 + (i % 8))).toISOString(),
    membership: from.membership,
    country: from.country,
  };
});

export const conversations: ConversationRecord[] = Array.from({ length: 20 }, (_, i) => {
  const a = users[i];
  const b = users[(i + 5) % users.length];
  return {
    id: `chat_${5000 + i}`,
    participants: [a.id, b.id],
    participantNames: [a.fullName, b.fullName],
    messageCount: 12 + i * 7,
    lastMessageAt: new Date(Date.UTC(2026, 10, 1 + (i % 6), 15)).toISOString(),
    reported: i % 6 === 0,
    deliveryErrors: i % 5 === 0 ? 2 : 0,
    status: i % 8 === 0 ? "restricted" : "active",
  };
});

export const reports: ReportRecord[] = [
  "Fake profile",
  "Impersonation",
  "Harassment",
  "Offensive messages",
  "Inappropriate photographs",
  "Spam",
  "Scam attempts",
  "Suspicious activity",
  "Threatening behaviour",
  "Underage account concerns",
].flatMap((category, ci) =>
  Array.from({ length: ci < 4 ? 4 : 2 }, (_, i) => {
    const reporter = users[(ci + i) % users.length];
    const reported = users[(ci + i + 9) % users.length];
    const statuses = [
      "new",
      "under_review",
      "escalated",
      "action_required",
      "resolved",
      "rejected",
    ] as const;
    return {
      id: `rpt_${6000 + ci * 10 + i}`,
      reporterId: reporter.id,
      reporterName: reporter.fullName,
      reportedId: reported.id,
      reportedName: reported.fullName,
      category,
      explanation: `User reported ${category.toLowerCase()} based on recent interactions.`,
      submittedAt: new Date(Date.UTC(2026, 10, 1 + ((ci + i) % 5), 11)).toISOString(),
      priority: (["critical", "high", "medium", "low"] as const)[(ci + i) % 4],
      assignedModerator: i % 2 === 0 ? "Noah Mensah" : null,
      status: statuses[(ci + i) % statuses.length],
      notes: "",
    };
  }),
);

export const plans: SubscriptionPlan[] = [
  {
    id: "plan_free",
    name: "Free",
    description: "Core discovery and messaging with daily like limits.",
    price: 0,
    currency: "USD",
    interval: "monthly",
    features: ["Basic discovery", "Limited daily likes", "Text messaging"],
    trialDays: 0,
    available: true,
    subscribers: 355909,
  },
  {
    id: "plan_premium_m",
    name: "Premium Monthly",
    description: "See who liked you, advanced filters, and boosted visibility.",
    price: 19.99,
    currency: "USD",
    interval: "monthly",
    features: [
      "See who liked you",
      "Advanced filters",
      "Increased daily likes",
      "Enhanced discovery visibility",
      "Profile boost",
    ],
    trialDays: 7,
    available: true,
    subscribers: 98420,
  },
  {
    id: "plan_premium_y",
    name: "Premium Annual",
    description: "Full premium benefits billed yearly with savings.",
    price: 149.99,
    currency: "USD",
    interval: "annual",
    features: [
      "All Premium Monthly benefits",
      "Priority support",
      "Seasonal promo access",
    ],
    trialDays: 7,
    available: true,
    subscribers: 27988,
  },
];

export const subscriptions: UserSubscription[] = users
  .filter((u) => u.membership === "premium")
  .map((u, i) => ({
    id: `sub_${7000 + i}`,
    userId: u.id,
    userName: u.fullName,
    planId: i % 2 === 0 ? "plan_premium_m" : "plan_premium_y",
    planName: i % 2 === 0 ? "Premium Monthly" : "Premium Annual",
    status: (["active", "active", "cancelled", "expired", "past_due"] as const)[i % 5],
    startedAt: u.registeredAt,
    renewsAt: u.subscriptionExpiresAt,
    provider: i % 3 === 0 ? "Apple" : i % 3 === 1 ? "Google Play" : "Stripe",
  }));

export const transactions: Transaction[] = Array.from({ length: 36 }, (_, i) => {
  const user = users[i % users.length];
  const statuses = [
    "successful",
    "successful",
    "pending",
    "failed",
    "refunded",
    "disputed",
    "cancelled",
  ] as const;
  const types = ["subscription", "boost", "promotion", "other"] as const;
  return {
    id: `txn_${8000 + i}`,
    userId: user.id,
    customerName: user.fullName,
    provider: i % 3 === 0 ? "Apple" : i % 3 === 1 ? "Google Play" : "Stripe",
    amount: types[i % 4] === "subscription" ? 19.99 : types[i % 4] === "boost" ? 4.99 : 9.99,
    currency: "USD",
    date: new Date(Date.UTC(2026, 9, 5 + (i % 30), 13)).toISOString(),
    type: types[i % 4],
    status: statuses[i % statuses.length],
  };
});

export const notifications: NotificationCampaign[] = [
  {
    id: "ntf_1",
    title: "Welcome to FindTenX Premium",
    message: "Unlock who liked you and boost your discovery this week.",
    category: "Subscription notifications",
    audience: "Premium users",
    channel: "push",
    status: "sent",
    scheduledAt: null,
    sentAt: "2026-11-01T10:00:00Z",
    sent: 98420,
    delivered: 96112,
    failed: 2308,
    read: 71204,
  },
  {
    id: "ntf_2",
    title: "Complete your profile",
    message: "Add three photos and your interests to get better matches.",
    category: "Account notifications",
    audience: "Newly registered users",
    channel: "in_app",
    status: "scheduled",
    scheduledAt: "2026-11-07T09:00:00Z",
    sentAt: null,
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
  },
  {
    id: "ntf_3",
    title: "Safety reminder",
    message: "Never share payment details outside FindTenX chats.",
    category: "Security notifications",
    audience: "All users",
    channel: "email",
    status: "draft",
    scheduledAt: null,
    sentAt: null,
    sent: 0,
    delivered: 0,
    failed: 0,
    read: 0,
  },
];

export const promotions: PromoCampaign[] = [
  {
    id: "promo_1",
    name: "Welcome Premium 30",
    description: "30% off first premium month for new users.",
    type: "Welcome campaign",
    audience: "Newly registered users",
    startDate: "2026-10-01",
    endDate: "2026-11-30",
    discountType: "percent",
    discountValue: 30,
    promoCode: "WELCOME30",
    usageLimit: 10000,
    usedCount: 4280,
    status: "active",
    registrations: 9120,
    conversions: 1844,
    revenue: 27640,
  },
  {
    id: "promo_2",
    name: "Referral Double Match",
    description: "Reward both parties after a successful referral signup.",
    type: "Referral campaign",
    audience: "All users",
    startDate: "2026-09-15",
    endDate: "2026-12-15",
    discountType: "fixed",
    discountValue: 5,
    promoCode: "REFER5",
    usageLimit: 50000,
    usedCount: 11240,
    status: "active",
    registrations: 6320,
    conversions: 2210,
    revenue: 18450,
  },
  {
    id: "promo_3",
    name: "Autumn Re-engage",
    description: "Bring back inactive members with a free boost week.",
    type: "User re-engagement",
    audience: "Inactive users",
    startDate: "2026-10-20",
    endDate: "2026-11-10",
    discountType: "percent",
    discountValue: 50,
    promoCode: "COMEBACK50",
    usageLimit: 8000,
    usedCount: 8000,
    status: "ended",
    registrations: 2104,
    conversions: 688,
    revenue: 9720,
  },
];

export const tickets: SupportTicket[] = [
  "Account issues",
  "Login problems",
  "Verification issues",
  "Subscription issues",
  "Payment problems",
  "Matching issues",
  "Messaging issues",
  "Profile issues",
  "Safety complaints",
  "Technical problems",
].map((category, i) => {
  const user = users[i + 2];
  const statuses = [
    "open",
    "in_progress",
    "waiting_for_user",
    "escalated",
    "resolved",
    "closed",
  ] as const;
  return {
    id: `tkt_${9000 + i}`,
    userId: user.id,
    userName: user.fullName,
    subject: `${category} — need assistance`,
    category,
    priority: (["urgent", "high", "medium", "low"] as const)[i % 4],
    assignedAgent: i % 2 === 0 ? "Sofia Adeyemi" : null,
    createdAt: new Date(Date.UTC(2026, 10, 2 + (i % 4), 10 + i)).toISOString(),
    status: statuses[i % statuses.length],
    messages: [
      {
        id: `msg_${i}_1`,
        author: user.fullName,
        body: `Hello, I need help with ${category.toLowerCase()}.`,
        at: new Date(Date.UTC(2026, 10, 2 + (i % 4), 10 + i)).toISOString(),
        internal: false,
      },
      ...(i % 2 === 0
        ? [
            {
              id: `msg_${i}_2`,
              author: "Sofia Adeyemi",
              body: "Thanks for contacting FindTenX support. We are reviewing this now.",
              at: new Date(Date.UTC(2026, 10, 2 + (i % 4), 11 + i)).toISOString(),
              internal: false,
            },
          ]
        : []),
    ],
  };
});

export const auditLogs: AuditLog[] = [
  {
    id: "aud_1",
    adminId: "adm_001",
    adminName: "Emma Paul",
    adminRole: "super_admin",
    action: "Administrator login",
    target: "Session",
    result: "success",
    reason: "Successful MFA",
    ip: "102.89.22.14",
    at: "2026-11-06T09:12:00Z",
  },
  {
    id: "aud_2",
    adminId: "adm_004",
    adminName: "Noah Mensah",
    adminRole: "moderator",
    action: "User suspension",
    target: "usr_1010",
    result: "success",
    reason: "Repeated harassment reports",
    ip: "41.203.70.11",
    at: "2026-11-06T07:55:00Z",
  },
  {
    id: "aud_3",
    adminId: "adm_003",
    adminName: "Amina Yusuf",
    adminRole: "verification",
    action: "Verification approved",
    target: "ver_2001",
    result: "success",
    reason: "Identity and liveness passed",
    ip: "105.112.18.44",
    at: "2026-11-06T08:58:00Z",
  },
  {
    id: "aud_4",
    adminId: "adm_006",
    adminName: "Daniel Chen",
    adminRole: "finance",
    action: "Refund reviewed",
    target: "txn_8012",
    result: "success",
    reason: "Duplicate charge confirmed by provider",
    ip: "18.204.55.90",
    at: "2026-11-05T15:20:00Z",
  },
  {
    id: "aud_5",
    adminId: "unknown",
    adminName: "Unknown",
    adminRole: "support",
    action: "Failed login",
    target: "Login",
    result: "failure",
    reason: "Invalid credentials",
    ip: "185.220.101.3",
    at: "2026-11-06T06:14:00Z",
  },
];

export const settings: PlatformSettings = {
  platformName: "FindTenX",
  supportEmail: "support@findtenx.com",
  supportPhone: "+1 800 836 8369",
  defaultLanguage: "en",
  defaultCurrency: "USD",
  timezone: "Africa/Lagos",
  minAge: 18,
  maxDiscoveryAge: 55,
  maxDiscoveryDistanceKm: 100,
  supportedCountries: [
    "Nigeria",
    "Ghana",
    "Kenya",
    "South Africa",
    "United Kingdom",
    "United States",
    "Canada",
  ],
  imageAttachmentLimitMb: 10,
  messageRetentionDays: 365,
};

export const discoveryConfig = {
  minAge: 18,
  maxAge: 55,
  maxDistanceKm: 100,
  genders: ["Female", "Male", "Other"],
  interests: [
    "Travel",
    "Music",
    "Fitness",
    "Food",
    "Art",
    "Tech",
    "Faith",
    "Sports",
    "Movies",
    "Reading",
  ],
  relationshipIntentions: ["Long-term", "Marriage", "Dating", "Friendship first"],
  matchingWeights: {
    ageCompatibility: 25,
    locationProximity: 20,
    sharedInterests: 20,
    relationshipIntentions: 15,
    profileCompleteness: 10,
    verificationStatus: 10,
  },
};

