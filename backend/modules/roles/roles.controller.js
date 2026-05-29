import { asyncHandler } from "../../middlewares/error.middleware.js";
import { sendSuccess } from "../../helpers/response.js";
import {
  PERMISSIONS,
  ROLE_LIST,
  ROLE_PERMISSIONS,
  ASSIGNABLE_ROLES,
  getPermissionsForRole,
} from "../../config/roles.js";

export const getRoles = asyncHandler(async (req, res) => {
  const roles = ROLE_LIST.map((role) => ({
    id: role,
    permissions: getPermissionsForRole(role),
  }));

  sendSuccess(
    res,
    200,
    {
      roles,
      assignableRoles: ASSIGNABLE_ROLES,
      permissions: PERMISSIONS,
      rolePermissions: ROLE_PERMISSIONS,
    },
    "Roles retrieved successfully"
  );
});
