const { getAccessTokenFromCookies, verifyAccessToken } = require("../lib/auth");
const { syncWorkspaceRolePermissions } = require("../lib/permissions");
const { prisma } = require("../lib/prisma");

async function requireAuth(req, res, next) {
  try {
    const accessToken = getAccessTokenFromCookies(req);

    if (!accessToken) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const payload = verifyAccessToken(accessToken);

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: payload.sub },
      select: { workspaceId: true }
    });

    await Promise.all(
      [...new Set(memberships.map((membership) => membership.workspaceId))].map((workspaceId) =>
        syncWorkspaceRolePermissions(prisma, workspaceId)
      )
    );

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        workspaceMemberships: {
          include: {
            workspace: {
              include: {
                rolePermissions: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid authentication token"
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired authentication token"
    });
  }
}

module.exports = { requireAuth };
