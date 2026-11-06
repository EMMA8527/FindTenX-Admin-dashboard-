export const roleLabels: Record<string, string> = {
  super_admin: "Super Administrator",
  operations: "Operations Administrator",
  verification: "Verification Officer",
  moderator: "Moderator",
  support: "Customer Support Agent",
  finance: "Finance Administrator",
  marketing: "Marketing Administrator",
};

export function formatRole(role: string) {
  return roleLabels[role] ?? role;
}
