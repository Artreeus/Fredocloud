function buildOpenApiSpec() {
  return {
    openapi: "3.0.3",
    info: {
      title: "FredoCloud API",
      version: "1.0.0",
      description:
        "REST API for the FredoCloud Collaborative Team Hub. Auth uses JWT cookies, and most endpoints require a signed-in session."
    },
    servers: [
      {
        url: "/",
        description: "Current deployment"
      }
    ],
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Workspaces" },
      { name: "Goals" },
      { name: "Announcements" },
      { name: "Action Items" },
      { name: "Notifications" },
      { name: "Analytics" },
      { name: "Uploads" }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "fredocloud_access_token"
        }
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string"
            }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            avatarUrl: {
              type: "string",
              nullable: true
            }
          }
        },
        Workspace: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            slug: { type: "string" },
            description: {
              type: "string",
              nullable: true
            },
            accentColor: { type: "string" },
            ownerId: { type: "string" },
            role: { type: "string" },
            permissions: {
              type: "array",
              items: { type: "string" }
            },
            memberCount: { type: "integer" }
          }
        },
        Goal: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: {
              type: "string",
              nullable: true
            },
            status: { type: "string" },
            priority: { type: "string" },
            progress: { type: "integer" },
            dueDate: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            workspaceId: { type: "string" }
          }
        },
        Announcement: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            content: { type: "string" },
            pinned: { type: "boolean" },
            workspaceId: { type: "string" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        ActionItem: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            description: {
              type: "string",
              nullable: true
            },
            status: { type: "string" },
            priority: { type: "string" },
            dueDate: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            workspaceId: { type: "string" }
          }
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string" },
            title: { type: "string" },
            message: { type: "string" },
            entityId: {
              type: "string",
              nullable: true
            },
            readAt: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            createdAt: { type: "string", format: "date-time" }
          }
        }
      }
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "API is healthy"
            }
          }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "User registered"
            },
            409: {
              description: "Email already exists",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" }
                }
              }
            }
          }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Login successful"
            },
            401: {
              description: "Invalid credentials"
            }
          }
        }
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access and refresh cookies",
          responses: {
            200: {
              description: "Tokens refreshed"
            },
            401: {
              description: "Invalid or missing refresh token"
            }
          }
        }
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout current session",
          responses: {
            200: {
              description: "Logged out"
            }
          }
        }
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" }
                    }
                  }
                }
              }
            }
          }
        },
        patch: {
          tags: ["Auth"],
          summary: "Update current user profile",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    avatarUrl: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: "Profile updated"
            }
          }
        }
      },
      "/api/workspaces": {
        get: {
          tags: ["Workspaces"],
          summary: "List current user's workspaces",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Workspace list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      workspaces: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Workspace" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Workspaces"],
          summary: "Create a workspace",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    accentColor: { type: "string", example: "#2745f2" }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Workspace created"
            }
          }
        }
      },
      "/api/workspaces/invitations": {
        get: {
          tags: ["Workspaces"],
          summary: "List pending invitations for the current user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Pending invitations"
            }
          }
        }
      },
      "/api/workspaces/invitations/{inviteId}/accept": {
        post: {
          tags: ["Workspaces"],
          summary: "Accept a workspace invitation",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "inviteId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Invitation accepted"
            }
          }
        }
      },
      "/api/workspaces/{id}": {
        patch: {
          tags: ["Workspaces"],
          summary: "Update a workspace",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Workspace updated"
            }
          }
        },
        delete: {
          tags: ["Workspaces"],
          summary: "Delete a workspace",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Workspace deleted"
            }
          }
        }
      },
      "/api/workspaces/{id}/members": {
        get: {
          tags: ["Workspaces"],
          summary: "List workspace members",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Workspace members"
            }
          }
        }
      },
      "/api/workspaces/{id}/permissions": {
        get: {
          tags: ["Workspaces"],
          summary: "Get workspace permission matrix",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Role permissions"
            }
          }
        }
      },
      "/api/goals": {
        get: {
          tags: ["Goals"],
          summary: "List goals",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "workspaceId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Goal list"
            }
          }
        },
        post: {
          tags: ["Goals"],
          summary: "Create a goal",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["workspaceId", "title"],
                  properties: {
                    workspaceId: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    assigneeId: { type: "string" },
                    dueDate: { type: "string", format: "date-time" },
                    status: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: "Goal created"
            }
          }
        }
      },
      "/api/goals/{id}": {
        get: {
          tags: ["Goals"],
          summary: "Get a goal",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Goal details"
            }
          }
        },
        patch: {
          tags: ["Goals"],
          summary: "Update a goal",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Goal updated"
            }
          }
        },
        delete: {
          tags: ["Goals"],
          summary: "Delete a goal",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Goal deleted"
            }
          }
        }
      },
      "/api/goals/{id}/milestones": {
        post: {
          tags: ["Goals"],
          summary: "Create a milestone for a goal",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            201: {
              description: "Milestone created"
            }
          }
        }
      },
      "/api/goals/{id}/milestones/{milestoneId}": {
        patch: {
          tags: ["Goals"],
          summary: "Update a milestone",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } },
            { in: "path", name: "milestoneId", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Milestone updated"
            }
          }
        }
      },
      "/api/goals/{id}/updates": {
        post: {
          tags: ["Goals"],
          summary: "Post a goal progress update",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            201: {
              description: "Goal update created"
            }
          }
        }
      },
      "/api/announcements": {
        get: {
          tags: ["Announcements"],
          summary: "List announcements",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Announcement list"
            }
          }
        },
        post: {
          tags: ["Announcements"],
          summary: "Create an announcement",
          security: [{ cookieAuth: [] }],
          responses: {
            201: {
              description: "Announcement created"
            }
          }
        }
      },
      "/api/announcements/{id}": {
        get: {
          tags: ["Announcements"],
          summary: "Get announcement details",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Announcement details"
            }
          }
        }
      },
      "/api/announcements/{id}/pin": {
        patch: {
          tags: ["Announcements"],
          summary: "Pin or unpin an announcement",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Announcement updated"
            }
          }
        }
      },
      "/api/announcements/{id}/reactions": {
        post: {
          tags: ["Announcements"],
          summary: "Toggle an announcement reaction",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Reaction updated"
            }
          }
        }
      },
      "/api/announcements/{id}/comments": {
        get: {
          tags: ["Announcements"],
          summary: "List announcement comments",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Comments list"
            }
          }
        },
        post: {
          tags: ["Announcements"],
          summary: "Create an announcement comment",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            201: {
              description: "Comment created"
            }
          }
        }
      },
      "/api/action-items": {
        get: {
          tags: ["Action Items"],
          summary: "List action items",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "workspaceId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Action items list"
            }
          }
        },
        post: {
          tags: ["Action Items"],
          summary: "Create an action item",
          security: [{ cookieAuth: [] }],
          responses: {
            201: {
              description: "Action item created"
            }
          }
        }
      },
      "/api/action-items/bulk-status": {
        patch: {
          tags: ["Action Items"],
          summary: "Bulk update action item status",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Action items updated"
            }
          }
        }
      },
      "/api/action-items/{id}": {
        patch: {
          tags: ["Action Items"],
          summary: "Update an action item",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Action item updated"
            }
          }
        },
        delete: {
          tags: ["Action Items"],
          summary: "Delete an action item",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Action item deleted"
            }
          }
        }
      },
      "/api/action-items/{id}/status": {
        patch: {
          tags: ["Action Items"],
          summary: "Quick-update an action item status",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Status updated"
            }
          }
        }
      },
      "/api/notifications": {
        get: {
          tags: ["Notifications"],
          summary: "List current user notifications",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Notifications list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      notifications: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Notification" }
                      },
                      unreadCount: { type: "integer" }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/api/notifications/{id}/read": {
        patch: {
          tags: ["Notifications"],
          summary: "Mark a notification as read",
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "id", required: true, schema: { type: "string" } }
          ],
          responses: {
            200: {
              description: "Notification marked as read"
            }
          }
        }
      },
      "/api/analytics/summary": {
        get: {
          tags: ["Analytics"],
          summary: "Get workspace analytics summary",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "workspaceId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "Analytics summary"
            }
          }
        }
      },
      "/api/analytics/export": {
        get: {
          tags: ["Analytics"],
          summary: "Export workspace analytics as CSV",
          security: [{ cookieAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "workspaceId",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            200: {
              description: "CSV export"
            }
          }
        }
      },
      "/api/upload": {
        post: {
          tags: ["Uploads"],
          summary: "Upload an avatar image",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    file: {
                      type: "string",
                      format: "binary"
                    }
                  },
                  required: ["file"]
                }
              }
            }
          },
          responses: {
            200: {
              description: "Upload successful"
            }
          }
        }
      }
    }
  };
}

module.exports = { buildOpenApiSpec };
