import { allowLocalPlatformData, getPlatformDataMode } from "@/lib/integrations/config";
import { probeFindtenxCore } from "@/lib/integrations/core-client";
import { probeFindtenxData } from "@/lib/integrations/data-client";

export type DataAuthority = "findtenx-core" | "admin_local_dev" | "unavailable";

export type PlatformAccess =
  | {
      ok: true;
      authority: "findtenx-core" | "admin_local_dev";
      production: boolean;
      mode: ReturnType<typeof getPlatformDataMode>;
      message: string;
    }
  | {
      ok: false;
      authority: "unavailable";
      production: false;
      mode: ReturnType<typeof getPlatformDataMode>;
      code: "CORE_REQUIRED" | "CORE_UNREACHABLE" | "CORE_UNAUTHORIZED";
      message: string;
      status: 503;
    };

/**
 * Decide whether platform modules may serve data.
 * Core is authoritative. Local SQLite is only allowed when PLATFORM_DATA_MODE=local_dev.
 */
export async function resolvePlatformAccess(): Promise<PlatformAccess> {
  const mode = getPlatformDataMode();
  const core = await probeFindtenxCore();

  if (core.configured && core.reachable && core.checkedPaths.some((p) => p.ok)) {
    return {
      ok: true,
      authority: "findtenx-core",
      production: true,
      mode,
      message: "Serving from FindTenX Core (authoritative).",
    };
  }

  if (allowLocalPlatformData()) {
    return {
      ok: true,
      authority: "admin_local_dev",
      production: false,
      mode,
      message:
        "PLATFORM_DATA_MODE=local_dev — serving admin-local SQLite for development only. This is not FindTenX Core / production.",
    };
  }

  if (!core.configured) {
    return {
      ok: false,
      authority: "unavailable",
      production: false,
      mode,
      code: "CORE_REQUIRED",
      status: 503,
      message:
        "FindTenX Core is not configured (FINDTENX_API_URL). Platform data will not be served from local bootstrap. Set Core credentials or PLATFORM_DATA_MODE=local_dev for explicit local-only development.",
    };
  }

  if (core.authenticated === false) {
    return {
      ok: false,
      authority: "unavailable",
      production: false,
      mode,
      code: "CORE_UNAUTHORIZED",
      status: 503,
      message: core.message,
    };
  }

  return {
    ok: false,
    authority: "unavailable",
    production: false,
    mode,
    code: "CORE_UNREACHABLE",
    status: 503,
    message: core.message,
  };
}

export async function getIntegrationStatus() {
  const [core, data] = await Promise.all([probeFindtenxCore(), probeFindtenxData()]);
  const access = await resolvePlatformAccess();
  const repoAccess = {
    adminDashboard: { listed: true, clone: "ok" as const },
    findtenxCore: {
      listed: true,
      clone: "forbidden_403" as const,
      detail: "Origin token not scoped for emmapaul852/findtenx-core",
    },
    findtenxData: {
      listed: true,
      clone: "forbidden_403" as const,
      detail: "Origin token not scoped for emmapaul852/findtenx-data",
    },
    findtenxMobile: { listed: false, clone: "not_found" as const },
  };

  return {
    checkedAt: new Date().toISOString(),
    platformDataMode: getPlatformDataMode(),
    access,
    core,
    data,
    repositories: repoAccess,
    providers: {
      payments: { enabled: false, reason: "Provider credentials not supplied; live payments disabled." },
      email: { enabled: false, reason: "Email provider not configured; live send disabled." },
      sms: { enabled: false, reason: "SMS provider not configured; live send disabled." },
      push: { enabled: false, reason: "Push provider not configured; live send disabled." },
      identityVerification: {
        enabled: false,
        reason: "IDV provider not configured; live identity checks disabled.",
      },
    },
  };
}
