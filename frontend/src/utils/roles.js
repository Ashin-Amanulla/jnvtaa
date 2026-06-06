export const ROLES = {
  MEMBER: "member",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const PERMISSIONS = {
  USERS_READ: "users:read",
  USERS_VERIFY: "users:verify",
  USERS_MANAGE: "users:manage",
  USERS_ROLES: "users:roles",
  USERS_DEACTIVATE: "users:deactivate",
  BATCHES_MANAGE: "batches:manage",
  BATCHES_DELETE: "batches:delete",
  EVENTS_MANAGE: "events:manage",
  EVENTS_DELETE: "events:delete",
  NEWS_MANAGE: "news:manage",
  NEWS_DELETE: "news:delete",
  GALLERY_MANAGE: "gallery:manage",
  GALLERY_MODERATE: "gallery:moderate",
  DONATIONS_MANAGE: "donations:manage",
  DONATIONS_DELETE: "donations:delete",
  JOBS_MANAGE: "jobs:manage",
  JOBS_DELETE: "jobs:delete",
  MENTORSHIP_MANAGE: "mentorship:manage",
  NEWSLETTER_MANAGE: "newsletter:manage",
  CONTACT_MANAGE: "contact:manage",
  SITE_CONTENT_MANAGE: "siteContent:manage",
  AUDIT_LOG_READ: "auditLog:read",
  SETTINGS_MANAGE: "settings:manage",
  FIFA_MANAGE: "fifa:manage",
};

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

export const isStaff = (user) =>
  user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

export const isAlumniMember = (user) =>
  user?.role === ROLES.MEMBER || user?.role === ROLES.ADMIN;

const ROLE_PERMISSIONS_FALLBACK = {
  [ROLES.MEMBER]: [],
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_VERIFY,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.BATCHES_MANAGE,
    PERMISSIONS.EVENTS_MANAGE,
    PERMISSIONS.NEWS_MANAGE,
    PERMISSIONS.GALLERY_MANAGE,
    PERMISSIONS.GALLERY_MODERATE,
    PERMISSIONS.DONATIONS_MANAGE,
    PERMISSIONS.JOBS_MANAGE,
    PERMISSIONS.MENTORSHIP_MANAGE,
    PERMISSIONS.NEWSLETTER_MANAGE,
    PERMISSIONS.CONTACT_MANAGE,
    PERMISSIONS.SITE_CONTENT_MANAGE,
    PERMISSIONS.FIFA_MANAGE,
  ],
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
};

export const getPermissionsForUser = (user) => {
  if (user?.permissions?.length) return user.permissions;
  return ROLE_PERMISSIONS_FALLBACK[user?.role] ?? [];
};

export const hasPermission = (user, permission) => {
  if (isSuperAdmin(user)) return true;
  const perms = getPermissionsForUser(user);
  if (!perms.length) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
};

export const hasAnyPermission = (user, permissions) =>
  permissions.some((permission) => hasPermission(user, permission));

export const canAccessAdmin = (user) => getPermissionsForUser(user).length > 0;

export const canAccessMemberDashboard = (user) => isAlumniMember(user);

export const getDefaultLandingPath = (user) =>
  canAccessAdmin(user) ? "/admin" : "/dashboard";

export const needsProfileSetup = (user) =>
  canAccessMemberDashboard(user) && !user?.batch;

export const getPostAuthPath = (user, nextPath) => {
  if (nextPath && nextPath.startsWith("/")) {
    return nextPath;
  }
  if (needsProfileSetup(user)) {
    return "/dashboard/profile?setup=1";
  }
  return getDefaultLandingPath(user);
};

export const formatRoleLabel = (role) =>
  role === ROLES.SUPER_ADMIN
    ? "Super Admin"
    : role?.replace(/_/g, " ") ?? role;
