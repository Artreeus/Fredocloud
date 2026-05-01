const bcrypt = require("bcryptjs");
const { AuditAction, WorkspaceRole } = require("../../generated/prisma");
const { slugify } = require("@repo/utils");
const {
  buildPublicUser,
  clearAuthCookies,
  compareToken,
  getRefreshTokenFromCookies,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require("../lib/auth");
const { prisma } = require("../lib/prisma");

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function persistRefreshToken(userId, refreshToken) {
  const refreshTokenHash = await hashToken(refreshToken);
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentRefreshTokenHash: refreshTokenHash,
      refreshTokenExpiresAt
    }
  });
}

async function fetchUserProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspaceMemberships: {
        include: {
          workspace: true
        }
      }
    }
  });
}

async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw createError("Name, email, and password are required", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw createError("An account with that email already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const workspaceName = `${name.split(" ")[0]}'s Workspace`;
    const workspaceSlugBase = slugify(`${name}-workspace`) || "workspace";
    const workspaceSlug = `${workspaceSlugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name
        }
      });

      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug: workspaceSlug,
          ownerId: createdUser.id
        }
      });

      await tx.workspaceMember.create({
        data: {
          userId: createdUser.id,
          workspaceId: workspace.id,
          role: WorkspaceRole.OWNER
        }
      });

      await tx.auditLog.create({
        data: {
          workspaceId: workspace.id,
          actorId: createdUser.id,
          action: AuditAction.USER_REGISTERED,
          entityType: "User",
          entityId: createdUser.id,
          metadata: {
            email: createdUser.email
          }
        }
      });

      return createdUser;
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await persistRefreshToken(user.id, refreshToken);
    setAuthCookies(res, accessToken, refreshToken);

    const profile = await fetchUserProfile(user.id);

    return res.status(201).json({
      message: "Registration successful",
      user: buildPublicUser(profile)
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw createError("Invalid email or password", 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw createError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await persistRefreshToken(user.id, refreshToken);

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: { workspaceId: true }
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: membership?.workspaceId,
        actorId: user.id,
        action: AuditAction.USER_LOGGED_IN,
        entityType: "User",
        entityId: user.id
      }
    });

    setAuthCookies(res, accessToken, refreshToken);

    const profile = await fetchUserProfile(user.id);

    return res.status(200).json({
      message: "Login successful",
      user: buildPublicUser(profile)
    });
  } catch (error) {
    return next(error);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = getRefreshTokenFromCookies(req);

    if (!refreshToken) {
      throw createError("Refresh token is required", 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user || !user.currentRefreshTokenHash) {
      throw createError("Invalid refresh token", 401);
    }

    if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
      throw createError("Refresh token has expired", 401);
    }

    const tokenMatches = await compareToken(refreshToken, user.currentRefreshTokenHash);

    if (!tokenMatches) {
      throw createError("Invalid refresh token", 401);
    }

    const nextAccessToken = signAccessToken(user);
    const nextRefreshToken = signRefreshToken(user);

    await persistRefreshToken(user.id, nextRefreshToken);

    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      select: { workspaceId: true }
    });

    await prisma.auditLog.create({
      data: {
        workspaceId: membership?.workspaceId,
        actorId: user.id,
        action: AuditAction.TOKEN_REFRESHED,
        entityType: "User",
        entityId: user.id
      }
    });

    setAuthCookies(res, nextAccessToken, nextRefreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully"
    });
  } catch (error) {
    clearAuthCookies(res);
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    const refreshToken = getRefreshTokenFromCookies(req);

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: payload.sub },
          select: { workspaceId: true }
        });

        await prisma.user.update({
          where: { id: payload.sub },
          data: {
            currentRefreshTokenHash: null,
            refreshTokenExpiresAt: null
          }
        });

        await prisma.auditLog.create({
          data: {
            workspaceId: membership?.workspaceId,
            actorId: payload.sub,
            action: AuditAction.USER_LOGGED_OUT,
            entityType: "User",
            entityId: payload.sub
          }
        });
      } catch (error) {
        // Clear cookies even if the token is invalid or already expired.
      }
    }

    clearAuthCookies(res);

    return res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    return res.status(200).json({
      user: buildPublicUser(req.user)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  logout,
  me,
  refresh,
  register
};
