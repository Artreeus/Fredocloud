const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { durationToMs } = require("./time");

function buildTokenPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    name: user.name
  };
}

function signAccessToken(user) {
  return jwt.sign(buildTokenPayload(user), env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });
}

function signRefreshToken(user) {
  return jwt.sign(buildTokenPayload(user), env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwtRefreshSecret);
}

async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

async function compareToken(token, hash) {
  if (!hash) {
    return false;
  }

  return bcrypt.compare(token, hash);
}

function setAuthCookies(res, accessToken, refreshToken) {
  const baseCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production"
  };

  res.cookie(env.accessTokenCookieName, accessToken, {
    ...baseCookieOptions,
    maxAge: durationToMs(env.jwtAccessExpiresIn)
  });

  res.cookie(env.refreshTokenCookieName, refreshToken, {
    ...baseCookieOptions,
    maxAge: durationToMs(env.jwtRefreshExpiresIn)
  });
}

function clearAuthCookies(res) {
  const baseCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production"
  };

  res.clearCookie(env.accessTokenCookieName, baseCookieOptions);
  res.clearCookie(env.refreshTokenCookieName, baseCookieOptions);
}

function getAccessTokenFromCookies(req) {
  return req.cookies?.[env.accessTokenCookieName];
}

function getRefreshTokenFromCookies(req) {
  return req.cookies?.[env.refreshTokenCookieName];
}

function buildPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    memberships: user.workspaceMemberships?.map((membership) => ({
      id: membership.id,
      role: membership.role,
      workspaceId: membership.workspaceId,
      workspaceName: membership.workspace?.name,
      workspaceSlug: membership.workspace?.slug,
      workspaceDescription: membership.workspace?.description,
      workspaceAccentColor: membership.workspace?.accentColor,
      workspaceOwnerId: membership.workspace?.ownerId
    }))
  };
}

module.exports = {
  buildPublicUser,
  clearAuthCookies,
  compareToken,
  getAccessTokenFromCookies,
  getRefreshTokenFromCookies,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
