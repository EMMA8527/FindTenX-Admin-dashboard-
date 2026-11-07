import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/permissions";
import {
  getStaticCatalog,
  getSettings,
  listAdmins,
  listConversations,
  listLikes,
  listMatches,
  listReports,
  listSubscriptions,
  listTickets,
  listTransactions,
  listVerifications,
} from "@/lib/db/module-queries";
import { getOverviewFromDb, listUsersFromDb, recentAudit } from "@/lib/db/queries";
import { requirePlatformAccess, withAuthority } from "@/lib/integrations/require-platform";

const resourcePermission: Record<string, Permission> = {
  overview: "overview.view",
  users: "users.view",
  profiles: "profiles.view",
  verifications: "verification.view",
  matches: "likes.view",
  likes: "likes.view",
  conversations: "chat.view",
  reports: "reports.view",
  subscriptions: "subscriptions.view",
  transactions: "payments.view",
  tickets: "support.view",
  notifications: "notifications.view",
  promotions: "promotions.view",
  plans: "subscriptions.view",
  discovery: "discovery.view",
  admins: "staff.view",
  settings: "settings.view",
  audit: "security.view",
  referrals: "referrals.view",
  communications: "communications.view",
  fraud: "fraud.view",
  content: "content.view",
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const resource = new URL(request.url).searchParams.get("resource") || "overview";
  const permission = resourcePermission[resource];
  if (!permission || !can(session.role, permission)) {
    return NextResponse.json({ error: "Permission denied" }, { status: 403 });
  }

  const gate = await requirePlatformAccess();
  if (gate.error) return gate.error;
  const { access } = gate;

  const staticCatalog = getStaticCatalog();

  switch (resource) {
    case "overview":
      return NextResponse.json(
        withAuthority(access, {
          metrics: getOverviewFromDb(),
        }),
      );
    case "users":
    case "profiles":
      return NextResponse.json(withAuthority(access, listUsersFromDb({ limit: 200 })));
    case "verifications":
      return NextResponse.json(withAuthority(access, { items: listVerifications() }));
    case "matches":
      return NextResponse.json(withAuthority(access, { items: listMatches() }));
    case "likes":
      return NextResponse.json(withAuthority(access, { items: listLikes() }));
    case "conversations":
      return NextResponse.json(withAuthority(access, { items: listConversations() }));
    case "reports":
      return NextResponse.json(withAuthority(access, { items: listReports() }));
    case "subscriptions":
      return NextResponse.json(
        withAuthority(access, { items: listSubscriptions(), plans: staticCatalog.plans }),
      );
    case "transactions":
      return NextResponse.json(withAuthority(access, { items: listTransactions() }));
    case "tickets":
      return NextResponse.json(withAuthority(access, { items: listTickets() }));
    case "notifications":
      if (access.authority !== "admin_local_dev") {
        return NextResponse.json(
          withAuthority(access, {
            items: [],
            incomplete: true,
            reason:
              "Notification campaigns require FindTenX Core communications APIs. Not serving seed campaign statistics as production.",
          }),
        );
      }
      return NextResponse.json(
        withAuthority(access, {
          items: staticCatalog.notifications,
          sample: true,
          reason: "local_dev sample campaigns only — not production delivery metrics.",
        }),
      );
    case "promotions":
      if (access.authority !== "admin_local_dev") {
        return NextResponse.json(
          withAuthority(access, {
            items: [],
            incomplete: true,
            reason:
              "Promotions and campaign revenue require FindTenX Core. Seed marketing figures are not shown as production.",
          }),
        );
      }
      return NextResponse.json(
        withAuthority(access, {
          items: staticCatalog.promotions,
          sample: true,
          reason: "local_dev sample promotions only — not production revenue.",
        }),
      );
    case "plans":
      return NextResponse.json(withAuthority(access, { items: staticCatalog.plans }));
    case "discovery":
      if (access.authority !== "admin_local_dev") {
        return NextResponse.json(
          withAuthority(access, {
            config: null,
            incomplete: true,
            reason: "Discovery matching configuration is owned by FindTenX Core.",
          }),
        );
      }
      return NextResponse.json(
        withAuthority(access, {
          config: staticCatalog.discovery,
          sample: true,
          reason: "local_dev sample discovery weights — not live Core matching config.",
        }),
      );
    case "admins":
      return NextResponse.json(withAuthority(access, { items: listAdmins() }));
    case "settings":
      return NextResponse.json(withAuthority(access, { settings: getSettings() }));
    case "audit":
      return NextResponse.json(withAuthority(access, { items: recentAudit(100) }));
    case "referrals":
      return NextResponse.json(
        withAuthority(access, {
          items: [],
          incomplete: true,
          reason: "Referral schema lives in FindTenX Core — awaiting Core repository access.",
        }),
      );
    case "communications":
      return NextResponse.json(
        withAuthority(access, {
          ...staticCatalog.communications,
          incomplete: true,
          reason: "Email/SMS/Push adapters disabled until provider credentials and Core templates are available.",
        }),
      );
    case "fraud":
      return NextResponse.json(
        withAuthority(access, {
          items: [],
          incomplete: true,
          reason: "Fraud signals require FindTenX Core + Data pipelines.",
        }),
      );
    case "content":
      return NextResponse.json(
        withAuthority(access, {
          items: [],
          incomplete: true,
          reason: "Website CMS content is not yet exposed by Core.",
        }),
      );
    default:
      return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  }
}
