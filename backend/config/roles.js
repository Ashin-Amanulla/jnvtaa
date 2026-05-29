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
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS = {
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
  ],
  [ROLES.SUPER_ADMIN]: ["*"],
};

export const ROLE_LIST = Object.keys(ROLE_PERMISSIONS);

export const ASSIGNABLE_ROLES = ROLE_LIST.filter(
  (role) => role !== ROLES.SUPER_ADMIN
);

export const getPermissionsForRole = (role) => {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return [];
  if (perms.includes("*")) return [...ALL_PERMISSIONS];
  return perms;
};

export const roleHasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  if (perms.includes("*")) return true;
  return perms.includes(permission);
};

export const isSuperAdmin = (user) => user?.role === ROLES.SUPER_ADMIN;

export const isStaff = (user) =>
  user?.role === ROLES.ADMIN || user?.role === ROLES.SUPER_ADMIN;

export const canAccessAdmin = (user) =>
  getPermissionsForRole(user?.role).length > 0;
