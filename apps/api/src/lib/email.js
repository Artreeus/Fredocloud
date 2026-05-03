const { env } = require("../config/env");

const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

function isEmailEnabled(templateId) {
  return Boolean(
    env.emailJsServiceId &&
      env.emailJsPublicKey &&
      env.emailJsPrivateKey &&
      templateId
  );
}

async function sendEmailJsTemplate(templateId, templateParams) {
  if (!isEmailEnabled(templateId)) {
    return {
      skipped: true,
      reason: "missing_emailjs_configuration"
    };
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      service_id: env.emailJsServiceId,
      template_id: templateId,
      user_id: env.emailJsPublicKey,
      accessToken: env.emailJsPrivateKey,
      template_params: templateParams
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`EmailJS request failed: ${response.status} ${errorText}`);
    error.statusCode = 502;
    throw error;
  }

  return {
    skipped: false,
    ok: true
  };
}

async function sendWorkspaceInviteEmail({
  toEmail,
  workspaceName,
  inviterName,
  role,
  inviteId,
  expiresAt
}) {
  return sendEmailJsTemplate(env.emailJsInviteTemplateId, {
    app_name: env.appName,
    to_email: toEmail,
    workspace_name: workspaceName,
    inviter_name: inviterName,
    role: role.toLowerCase(),
    invite_id: inviteId,
    invite_link: `${env.clientUrl}/login`,
    dashboard_link: `${env.clientUrl}/dashboard`,
    expires_at: new Date(expiresAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    })
  });
}

async function sendMentionEmail({
  toEmail,
  mentionedUserName,
  actorName,
  workspaceName,
  announcementTitle,
  announcementId,
  commentBody
}) {
  return sendEmailJsTemplate(env.emailJsMentionTemplateId, {
    app_name: env.appName,
    to_email: toEmail,
    mentioned_user_name: mentionedUserName,
    actor_name: actorName,
    workspace_name: workspaceName,
    announcement_title: announcementTitle,
    comment_body: commentBody,
    resource_link: `${env.clientUrl}/announcements/${announcementId}`
  });
}

module.exports = {
  isEmailEnabled,
  sendMentionEmail,
  sendWorkspaceInviteEmail
};
