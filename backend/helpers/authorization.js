import { roleHasPermission, canAccessAdmin } from "../config/roles.js";

export const canModifyResource = (ownerId, user, managePermission) => {
  if (!user) return false;
  if (roleHasPermission(user.role, managePermission)) return true;
  return ownerId?.toString() === user.id?.toString();
};

export const canViewUnpublished = (req, managePermission) => {
  const adminAll =
    req.query.adminAll === "true" || req.query.adminAll === true;
  if (!adminAll || !req.user) return false;
  if (managePermission) {
    return roleHasPermission(req.user.role, managePermission);
  }
  return canAccessAdmin(req.user);
};
