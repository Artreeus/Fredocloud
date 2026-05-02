const { Server } = require("socket.io");
const { env } = require("../config/env");
const { verifyAccessToken, verifyRefreshToken } = require("./auth");
const { prisma } = require("./prisma");

let io;
const workspacePresence = new Map();

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, cookie) => {
      const separatorIndex = cookie.indexOf("=");

      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = cookie.slice(0, separatorIndex);
      const value = cookie.slice(separatorIndex + 1);
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function getWorkspacePresenceMap(workspaceId) {
  if (!workspacePresence.has(workspaceId)) {
    workspacePresence.set(workspaceId, new Map());
  }

  return workspacePresence.get(workspaceId);
}

function getActiveUserIds(workspaceId) {
  return [...getWorkspacePresenceMap(workspaceId).entries()]
    .filter(([, count]) => count > 0)
    .map(([userId]) => userId);
}

async function resolveSocketUser(socket) {
  const cookies = parseCookies(socket.handshake.headers.cookie || "");
  const accessToken = cookies[env.accessTokenCookieName];
  const refreshToken = cookies[env.refreshTokenCookieName];
  let payload = null;

  if (accessToken) {
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      payload = null;
    }
  }

  if (!payload && refreshToken) {
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      payload = null;
    }
  }

  if (!payload?.sub) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true
    }
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

function getWorkspaceIdFromNamespace(socket) {
  return socket.nsp.name.replace(/^\/ws\//, "");
}

function emitWorkspaceEvent(workspaceId, eventName, payload) {
  if (!io) {
    return;
  }

  io.of(`/ws/${workspaceId}`).emit(eventName, payload);
}

function initSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true
    }
  });

  const workspaceNamespace = io.of(/^\/ws\/.+$/);

  workspaceNamespace.use(async (socket, next) => {
    try {
      const user = await resolveSocketUser(socket);
      const workspaceId = getWorkspaceIdFromNamespace(socket);
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId
          }
        }
      });

      if (!membership) {
        return next(new Error("Forbidden"));
      }

      socket.data.user = user;
      socket.data.workspaceId = workspaceId;
      return next();
    } catch (error) {
      return next(error);
    }
  });

  workspaceNamespace.on("connection", (socket) => {
    const { user, workspaceId } = socket.data;
    const presenceMap = getWorkspacePresenceMap(workspaceId);
    const previousCount = presenceMap.get(user.id) || 0;
    presenceMap.set(user.id, previousCount + 1);

    socket.emit("presence:sync", {
      userIds: getActiveUserIds(workspaceId)
    });

    if (previousCount === 0) {
      socket.nsp.emit("user:online", {
        userId: user.id
      });
    }

    socket.on("disconnect", () => {
      const nextCount = Math.max(0, (presenceMap.get(user.id) || 1) - 1);

      if (nextCount === 0) {
        presenceMap.delete(user.id);
        socket.nsp.emit("user:offline", {
          userId: user.id
        });
      } else {
        presenceMap.set(user.id, nextCount);
      }

      if (!presenceMap.size) {
        workspacePresence.delete(workspaceId);
      }
    });
  });

  return io;
}

module.exports = {
  emitWorkspaceEvent,
  initSocketServer
};
