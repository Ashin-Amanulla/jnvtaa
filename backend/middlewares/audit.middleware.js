import AuditLog from "../modules/audit-log/audit-log.model.js";

export const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const resourceId =
          req.params.id ||
          req.params.key ||
          body?.data?.content?._id?.toString?.() ||
          body?.data?.news?._id?.toString?.() ||
          body?.data?.event?._id?.toString?.() ||
          "";

        AuditLog.create({
          actor: req.user.id,
          action,
          resourceType,
          resourceId: String(resourceId),
          before: req.auditBefore || null,
          after: req.body || null,
          ip:
            req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
            req.ip ||
            req.socket?.remoteAddress ||
            "",
        }).catch((err) => console.error("Audit log failed:", err.message));
      }

      return originalJson(body);
    };

    next();
  };
};

export default auditLog;
