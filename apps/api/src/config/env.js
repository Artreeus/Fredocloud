const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSameSite: process.env.COOKIE_SAME_SITE || undefined,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  accessTokenCookieName: process.env.ACCESS_TOKEN_COOKIE_NAME || "fredocloud_access_token",
  refreshTokenCookieName:
    process.env.REFRESH_TOKEN_COOKIE_NAME || "fredocloud_refresh_token",
  emailJsServiceId: process.env.EMAILJS_SERVICE_ID || "",
  emailJsPublicKey: process.env.EMAILJS_PUBLIC_KEY || "",
  emailJsPrivateKey: process.env.EMAILJS_PRIVATE_KEY || "",
  emailJsInviteTemplateId: process.env.EMAILJS_INVITE_TEMPLATE_ID || "",
  emailJsMentionTemplateId: process.env.EMAILJS_MENTION_TEMPLATE_ID || "",
  appName: process.env.APP_NAME || "FredoCloud",
  pusherAppId: process.env.PUSHER_APP_ID || "",
  pusherKey: process.env.PUSHER_KEY || "",
  pusherSecret: process.env.PUSHER_SECRET || "",
  pusherCluster: process.env.PUSHER_CLUSTER || "mt1"
};

module.exports = { env };
