import { asyncHandler } from "../../middlewares/error.middleware.js";
import AuditLog from "./audit-log.model.js";
import { sendPaginated } from "../../helpers/response.js";
import {
  getPaginationParams,
  getPaginationMeta,
} from "../../helpers/pagination.js";

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req.query);
  const { actor, action, resourceType, resourceId, from, to } = req.query;

  const query = {};

  if (actor) query.actor = actor;
  if (action) query.action = action;
  if (resourceType) query.resourceType = resourceType;
  if (resourceId) query.resourceId = resourceId;

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }

  const auditLogs = await AuditLog.find(query)
    .populate("actor", "firstName lastName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(query);
  const pagination = getPaginationMeta(total, page, limit);

  sendPaginated(
    res,
    200,
    { auditLogs },
    pagination,
    "Audit logs retrieved successfully"
  );
});
