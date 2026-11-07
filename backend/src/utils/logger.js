import AuditLog from '../models/AuditLog.js';

/**
 * Record an audit log entry
 */
export const logAudit = async ({
  userId = null,
  action,
  resourceType,
  resourceId = null,
  details = {},
  req = null,
}) => {
  try {
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    await AuditLog.create({
      user: userId,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('[AuditLog Error]', error.message);
  }
};

