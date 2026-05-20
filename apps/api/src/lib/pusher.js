const Pusher = require("pusher");
const { env } = require("../config/env");

const pusher = new Pusher({
  appId: env.pusherAppId,
  key: env.pusherKey,
  secret: env.pusherSecret,
  cluster: env.pusherCluster,
  useTLS: true
});

function triggerWorkspaceEvent(workspaceId, eventName, payload) {
  return pusher.trigger(`private-workspace-${workspaceId}`, eventName, payload);
}

module.exports = { pusher, triggerWorkspaceEvent };
