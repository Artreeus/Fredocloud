const bcrypt = require("bcryptjs");
const { slugify } = require("@repo/utils");
const {
  ActionItemStatus,
  AuditAction,
  NotificationType,
  PrismaClient,
  Priority,
  ReactionType,
  WorkspaceRole
} = require("../generated/prisma");
const { syncWorkspaceRolePermissions } = require("../src/lib/permissions");

const prisma = new PrismaClient();

const demoPassword = "Demo@12345";

const users = [
  { id: "seed-user-demo", name: "Demo User", email: "demo@fredocloud.com" },
  { id: "seed-user-sarah", name: "Sarah Chen", email: "sarah@fredocloud.com" },
  { id: "seed-user-omar", name: "Omar Rahman", email: "omar@fredocloud.com" },
  { id: "seed-user-priya", name: "Priya Das", email: "priya@fredocloud.com" },
  { id: "seed-user-jordan", name: "Jordan Lee", email: "jordan@fredocloud.com" },
  { id: "seed-user-elena", name: "Elena Garcia", email: "elena@fredocloud.com" },
  { id: "seed-user-maya", name: "Maya Noor", email: "maya@fredocloud.com" },
  { id: "seed-user-alex", name: "Alex Rivera", email: "alex@fredocloud.com" },
  { id: "seed-user-sam", name: "Sam Wilson", email: "sam@fredocloud.com" },
  { id: "seed-user-taylor", name: "Taylor Smith", email: "taylor@fredocloud.com" }
];

const workspaceBlueprints = [
  {
    id: "seed-workspace-product",
    name: "Product Command",
    description: "Cross-functional workspace for roadmap delivery and launch readiness.",
    accentColor: "#2745f2",
    ownerId: "seed-user-demo",
    members: [
      { userId: "seed-user-demo", role: WorkspaceRole.OWNER },
      { userId: "seed-user-sarah", role: WorkspaceRole.ADMIN },
      { userId: "seed-user-omar", role: WorkspaceRole.MEMBER },
      { userId: "seed-user-priya", role: WorkspaceRole.MEMBER }
    ],
    goals: [
      {
        id: "seed-goal-product-launch",
        title: "Launch collaborative hub beta",
        description: "Coordinate product, design, and engineering work for the beta release.",
        status: "IN_PROGRESS",
        priority: Priority.HIGH,
        progress: 72,
        dueDate: "2026-05-24T00:00:00.000Z",
        createdById: "seed-user-demo",
        assigneeId: "seed-user-sarah",
        milestones: [
          {
            id: "seed-milestone-beta-onboarding",
            title: "Finalize onboarding flow",
            progress: 100,
            ownerId: "seed-user-priya"
          },
          {
            id: "seed-milestone-beta-qa",
            title: "Close beta QA checklist",
            progress: 60,
            ownerId: "seed-user-omar"
          },
          {
            id: "seed-milestone-beta-launch-plan",
            title: "Prepare launch brief",
            progress: 55,
            ownerId: "seed-user-sarah"
          }
        ],
        updates: [
          {
            id: "seed-goal-update-beta-1",
            authorId: "seed-user-sarah",
            body: "Design sign-off is complete and the launch checklist is now in motion."
          },
          {
            id: "seed-goal-update-beta-2",
            authorId: "seed-user-omar",
            body: "QA found two medium-priority issues. Fixes are in review."
          }
        ]
      },
      {
        id: "seed-goal-product-analytics",
        title: "Ship analytics dashboard v1",
        description: "Deliver workspace insights for goal completion, task health, and engagement.",
        status: "NOT_STARTED",
        priority: Priority.MEDIUM,
        progress: 20,
        dueDate: "2026-06-03T00:00:00.000Z",
        createdById: "seed-user-demo",
        assigneeId: "seed-user-omar",
        milestones: [
          {
            id: "seed-milestone-analytics-scope",
            title: "Define KPI set",
            progress: 70,
            ownerId: "seed-user-demo"
          },
          {
            id: "seed-milestone-analytics-ui",
            title: "Draft dashboard cards",
            progress: 0,
            ownerId: "seed-user-priya"
          }
        ],
        updates: [
          {
            id: "seed-goal-update-analytics-1",
            authorId: "seed-user-demo",
            body: "We agreed on the first metrics set: goal throughput, overdue actions, and engagement."
          }
        ]
      },
      {
        id: "seed-goal-product-infra",
        title: "Scale infrastructure for 10k users",
        description: "Optimize database performance and server auto-scaling to handle projected growth.",
        status: "NOT_STARTED",
        priority: Priority.HIGH,
        progress: 10,
        dueDate: "2026-07-15T00:00:00.000Z",
        createdById: "seed-user-demo",
        assigneeId: "seed-user-omar",
        milestones: [
          {
            id: "seed-milestone-infra-audit",
            title: "Performance audit",
            progress: 50,
            ownerId: "seed-user-omar"
          }
        ],
        updates: []
      },
      {
        id: "seed-goal-product-mobile",
        title: "Develop mobile app MVP",
        description: "Build a React Native wrapper to bring the collaborative experience to iOS and Android.",
        status: "NOT_STARTED",
        priority: Priority.MEDIUM,
        progress: 0,
        dueDate: "2026-08-30T00:00:00.000Z",
        createdById: "seed-user-demo",
        assigneeId: "seed-user-priya",
        milestones: [
          {
            id: "seed-milestone-mobile-wireframes",
            title: "Finalize mobile UX wireframes",
            progress: 20,
            ownerId: "seed-user-priya"
          }
        ],
        updates: []
      }
    ],
    announcements: [
      {
        id: "seed-announcement-beta-kickoff",
        title: "Beta launch countdown",
        body: "<p>We are officially in beta launch mode. Please keep all cross-team blockers in this workspace so we can resolve them quickly.</p><p><strong>Focus this week:</strong> QA readiness, onboarding polish, and launch comms.</p>",
        pinned: true,
        authorId: "seed-user-demo",
        publishedAt: "2026-05-01T09:00:00.000Z",
        comments: [
          {
            id: "seed-comment-beta-kickoff-1",
            authorId: "seed-user-priya",
            body: "Onboarding polish is in progress. I will post a walkthrough by tomorrow."
          },
          {
            id: "seed-comment-beta-kickoff-2",
            authorId: "seed-user-omar",
            body: "QA list is updated. Two fixes are waiting on final review."
          }
        ],
        reactions: [
          { id: "seed-reaction-beta-kickoff-like", userId: "seed-user-sarah", type: ReactionType.LIKE },
          { id: "seed-reaction-beta-kickoff-celebrate", userId: "seed-user-omar", type: ReactionType.CELEBRATE }
        ]
      },
      {
        id: "seed-announcement-beta-demo",
        title: "Internal demo on Friday",
        body: "<p>We will run a full product walkthrough on Friday at 4pm. Please make sure your screens are demo-ready and seeded with meaningful content.</p>",
        pinned: false,
        authorId: "seed-user-sarah",
        publishedAt: "2026-05-02T11:30:00.000Z",
        comments: [],
        reactions: [
          { id: "seed-reaction-beta-demo-support", userId: "seed-user-priya", type: ReactionType.SUPPORT }
        ]
      },
      {
        id: "seed-announcement-infra-ready",
        title: "Infrastructure baseline complete",
        body: "<p>The core infrastructure for auto-scaling is now in place. We are ready to begin stress-testing for high concurrency.</p>",
        pinned: false,
        authorId: "seed-user-omar",
        publishedAt: "2026-05-03T14:20:00.000Z",
        comments: [],
        reactions: [
          { id: "seed-reaction-infra-like", userId: "seed-user-demo", type: ReactionType.LIKE }
        ]
      }
    ],
    actionItems: [
      {
        id: "seed-action-product-copy",
        title: "Tighten dashboard copy",
        description: "Update hero text and empty states before the Friday demo.",
        assigneeId: "seed-user-priya",
        goalId: "seed-goal-product-launch",
        status: ActionItemStatus.OPEN,
        priority: Priority.HIGH,
        dueDate: "2026-05-04T00:00:00.000Z"
      },
      {
        id: "seed-action-product-qa",
        title: "Resolve QA regressions",
        description: "Clear the remaining issues from the beta checklist.",
        assigneeId: "seed-user-omar",
        goalId: "seed-goal-product-launch",
        status: ActionItemStatus.IN_PROGRESS,
        priority: Priority.URGENT,
        dueDate: "2026-05-03T00:00:00.000Z"
      },
      {
        id: "seed-action-product-insights",
        title: "Outline analytics cards",
        description: "Define the initial dashboard card set and success metrics.",
        assigneeId: "seed-user-demo",
        goalId: "seed-goal-product-analytics",
        status: ActionItemStatus.DONE,
        priority: Priority.MEDIUM,
        dueDate: "2026-04-30T00:00:00.000Z",
        completedAt: "2026-04-29T15:00:00.000Z"
      },
      {
        id: "seed-action-product-autoscaling",
        title: "Configure auto-scaling groups",
        description: "Set up AWS ASGs based on CPU and memory utilization thresholds.",
        assigneeId: "seed-user-omar",
        goalId: "seed-goal-product-infra",
        status: ActionItemStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: "2026-05-15T00:00:00.000Z"
      },
      {
        id: "seed-action-product-mobile-ux",
        title: "Draft mobile wireframes",
        description: "Create initial lo-fi wireframes for the dashboard and goals view.",
        assigneeId: "seed-user-priya",
        goalId: "seed-goal-product-mobile",
        status: ActionItemStatus.OPEN,
        priority: Priority.MEDIUM,
        dueDate: "2026-05-20T00:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "seed-notification-beta-goal",
        userId: "seed-user-sarah",
        type: NotificationType.GOAL_ASSIGNED,
        title: "You are leading the beta launch goal",
        message: "Coordinate the remaining work and keep the team updated on blockers.",
        entityId: "seed-goal-product-launch"
      },
      {
        id: "seed-notification-beta-action",
        userId: "seed-user-omar",
        type: NotificationType.ACTION_ITEM_ASSIGNED,
        title: "QA regressions assigned",
        message: "Please clear the remaining regressions before the internal demo.",
        entityId: "seed-action-product-qa"
      }
    ],
    auditLogs: [
      {
        id: "seed-audit-product-workspace",
        actorId: "seed-user-demo",
        action: AuditAction.WORKSPACE_CREATED,
        entityType: "Workspace",
        entityId: "seed-workspace-product",
        metadata: { seeded: true, label: "Product workspace" }
      }
    ]
  },
  {
    id: "seed-workspace-design",
    name: "Design Studio",
    description: "Workspace for design systems, UX polish, and content reviews.",
    accentColor: "#0f766e",
    ownerId: "seed-user-priya",
    members: [
      { userId: "seed-user-priya", role: WorkspaceRole.OWNER },
      { userId: "seed-user-elena", role: WorkspaceRole.ADMIN },
      { userId: "seed-user-demo", role: WorkspaceRole.MEMBER },
      { userId: "seed-user-jordan", role: WorkspaceRole.MEMBER }
    ],
    goals: [
      {
        id: "seed-goal-design-system",
        title: "Refresh internal design system",
        description: "Bring auth, dashboard, and workspace surfaces into one visual language.",
        status: "IN_PROGRESS",
        priority: Priority.HIGH,
        progress: 65,
        dueDate: "2026-05-18T00:00:00.000Z",
        createdById: "seed-user-priya",
        assigneeId: "seed-user-elena",
        milestones: [
          {
            id: "seed-milestone-design-tokens",
            title: "Align color and spacing tokens",
            progress: 100,
            ownerId: "seed-user-priya"
          },
          {
            id: "seed-milestone-design-shell",
            title: "Polish app shell",
            progress: 80,
            ownerId: "seed-user-elena"
          }
        ],
        updates: [
          {
            id: "seed-goal-update-design-1",
            authorId: "seed-user-elena",
            body: "Navbar, shell cards, and auth screens are visually aligned now."
          }
        ]
      }
    ],
    announcements: [
      {
        id: "seed-announcement-design-crit",
        title: "Design crit moved to Monday",
        body: "<p>The weekly design crit is moving to Monday morning to make room for launch support on Friday.</p>",
        pinned: false,
        authorId: "seed-user-priya",
        publishedAt: "2026-05-02T08:15:00.000Z",
        comments: [
          {
            id: "seed-comment-design-crit-1",
            authorId: "seed-user-jordan",
            body: "That helps. I will bring the new layout explorations to the Monday session."
          }
        ],
        reactions: [
          { id: "seed-reaction-design-crit-like", userId: "seed-user-demo", type: ReactionType.LIKE }
        ]
      }
    ],
    actionItems: [
      {
        id: "seed-action-design-audit",
        title: "Audit settings page spacing",
        description: "Check profile and workspace pages for visual consistency.",
        assigneeId: "seed-user-jordan",
        goalId: "seed-goal-design-system",
        status: ActionItemStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: "2026-05-05T00:00:00.000Z"
      },
      {
        id: "seed-action-design-library",
        title: "Document modal patterns",
        description: "Write short guidance for form modals and detail panels.",
        assigneeId: "seed-user-demo",
        goalId: "seed-goal-design-system",
        status: ActionItemStatus.OPEN,
        priority: Priority.MEDIUM,
        dueDate: "2026-05-09T00:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "seed-notification-design-goal",
        userId: "seed-user-elena",
        type: NotificationType.GOAL_ASSIGNED,
        title: "Design system refresh assigned",
        message: "Lead the remaining polish pass for the internal workspace screens.",
        entityId: "seed-goal-design-system"
      }
    ],
    auditLogs: [
      {
        id: "seed-audit-design-workspace",
        actorId: "seed-user-priya",
        action: AuditAction.WORKSPACE_CREATED,
        entityType: "Workspace",
        entityId: "seed-workspace-design",
        metadata: { seeded: true, label: "Design workspace" }
      }
    ]
  },
  {
    id: "seed-workspace-ops",
    name: "Ops Pulse",
    description: "Operations workspace for incidents, rituals, and execution tracking.",
    accentColor: "#ea580c",
    ownerId: "seed-user-maya",
    members: [
      { userId: "seed-user-maya", role: WorkspaceRole.OWNER },
      { userId: "seed-user-demo", role: WorkspaceRole.ADMIN },
      { userId: "seed-user-omar", role: WorkspaceRole.MEMBER }
    ],
    goals: [
      {
        id: "seed-goal-ops-readiness",
        title: "Stabilize weekly operations rhythm",
        description: "Make incident reviews, support handoff, and reporting predictable each week.",
        status: "IN_PROGRESS",
        priority: Priority.MEDIUM,
        progress: 48,
        dueDate: "2026-05-28T00:00:00.000Z",
        createdById: "seed-user-maya",
        assigneeId: "seed-user-demo",
        milestones: [
          {
            id: "seed-milestone-ops-runbook",
            title: "Document the support runbook",
            progress: 80,
            ownerId: "seed-user-maya"
          },
          {
            id: "seed-milestone-ops-review",
            title: "Launch weekly review ritual",
            progress: 20,
            ownerId: "seed-user-demo"
          }
        ],
        updates: [
          {
            id: "seed-goal-update-ops-1",
            authorId: "seed-user-maya",
            body: "The first runbook draft is done and the review agenda is ready for next week."
          }
        ]
      }
    ],
    announcements: [
      {
        id: "seed-announcement-ops-standup",
        title: "Operations standup starts Monday",
        body: "<p>We are starting a 15-minute operations standup every Monday to review incidents, support gaps, and upcoming risk areas.</p>",
        pinned: true,
        authorId: "seed-user-maya",
        publishedAt: "2026-05-02T13:00:00.000Z",
        comments: [
          {
            id: "seed-comment-ops-standup-1",
            authorId: "seed-user-demo",
            body: "I will bring the first support trend summary to the meeting."
          }
        ],
        reactions: [
          { id: "seed-reaction-ops-standup-like", userId: "seed-user-demo", type: ReactionType.LIKE },
          { id: "seed-reaction-ops-standup-support", userId: "seed-user-omar", type: ReactionType.SUPPORT }
        ]
      }
    ],
    actionItems: [
      {
        id: "seed-action-ops-runbook",
        title: "Finish incident runbook",
        description: "Cover escalation, ownership, and follow-up expectations.",
        assigneeId: "seed-user-maya",
        goalId: "seed-goal-ops-readiness",
        status: ActionItemStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: "2026-05-07T00:00:00.000Z"
      },
      {
        id: "seed-action-ops-report",
        title: "Draft weekly support report",
        description: "Summarize ticket volume, response times, and unresolved risks.",
        assigneeId: "seed-user-demo",
        goalId: "seed-goal-ops-readiness",
        status: ActionItemStatus.OPEN,
        priority: Priority.MEDIUM,
        dueDate: "2026-05-08T00:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "seed-notification-ops-goal",
        userId: "seed-user-demo",
        type: NotificationType.GOAL_ASSIGNED,
        title: "Operations readiness goal assigned",
        message: "Help formalize the weekly operations cadence and reporting loop.",
        entityId: "seed-goal-ops-readiness"
      }
    ],
    auditLogs: [
      {
        id: "seed-audit-ops-workspace",
        actorId: "seed-user-maya",
        action: AuditAction.WORKSPACE_CREATED,
        entityType: "Workspace",
        entityId: "seed-workspace-ops",
        metadata: { seeded: true, label: "Ops workspace" }
      }
    ]
  },
  {
    id: "seed-workspace-marketing",
    name: "Marketing Launchpad",
    description: "Hub for campaign coordination, brand management, and market expansion.",
    accentColor: "#f59e0b",
    ownerId: "seed-user-alex",
    members: [
      { userId: "seed-user-alex", role: WorkspaceRole.OWNER },
      { userId: "seed-user-sam", role: WorkspaceRole.ADMIN },
      { userId: "seed-user-taylor", role: WorkspaceRole.MEMBER },
      { userId: "seed-user-demo", role: WorkspaceRole.MEMBER }
    ],
    goals: [
      {
        id: "seed-goal-marketing-campaign",
        title: "Q3 Global Awareness Campaign",
        description: "Execute a multi-channel campaign to increase brand visibility by 40%.",
        status: "IN_PROGRESS",
        priority: Priority.HIGH,
        progress: 35,
        dueDate: "2026-09-30T00:00:00.000Z",
        createdById: "seed-user-alex",
        assigneeId: "seed-user-sam",
        milestones: [
          {
            id: "seed-milestone-marketing-creative",
            title: "Finalize creative assets",
            progress: 100,
            ownerId: "seed-user-taylor"
          },
          {
            id: "seed-milestone-marketing-ads",
            title: "Setup ad platforms",
            progress: 10,
            ownerId: "seed-user-sam"
          }
        ],
        updates: [
          {
            id: "seed-goal-update-marketing-1",
            authorId: "seed-user-taylor",
            body: "The new ad banners and social videos are ready for review."
          }
        ]
      },
      {
        id: "seed-goal-brand-refresh",
        title: "Brand Identity Refresh",
        description: "Modernize the brand voice and visual elements across all platforms.",
        status: "NOT_STARTED",
        priority: Priority.MEDIUM,
        progress: 5,
        dueDate: "2026-11-15T00:00:00.000Z",
        createdById: "seed-user-alex",
        assigneeId: "seed-user-taylor",
        milestones: [
          {
            id: "seed-milestone-brand-audit",
            title: "Complete brand audit",
            progress: 20,
            ownerId: "seed-user-alex"
          }
        ],
        updates: []
      }
    ],
    announcements: [
      {
        id: "seed-announcement-marketing-welcome",
        title: "Welcome to the Marketing Launchpad!",
        body: "<p>This is where we coordinate all things marketing. Please check the 'Goals' section for our latest campaign updates.</p>",
        pinned: true,
        authorId: "seed-user-alex",
        publishedAt: "2026-05-01T10:00:00.000Z",
        comments: [
          {
            id: "seed-comment-marketing-welcome-1",
            authorId: "seed-user-sam",
            body: "Great to have this centralized. Excited to get Q3 moving!"
          }
        ],
        reactions: [
          { id: "seed-reaction-marketing-welcome-like", userId: "seed-user-demo", type: ReactionType.LIKE }
        ]
      }
    ],
    actionItems: [
      {
        id: "seed-action-marketing-copy",
        title: "Review campaign ad copy",
        description: "Approve the messaging for the upcoming LinkedIn and Twitter ads.",
        assigneeId: "seed-user-alex",
        goalId: "seed-goal-marketing-campaign",
        status: ActionItemStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: "2026-05-10T00:00:00.000Z"
      },
      {
        id: "seed-action-marketing-social",
        title: "Finalize social media calendar",
        description: "Ensure all posts are scheduled for the next two weeks.",
        assigneeId: "seed-user-taylor",
        goalId: "seed-goal-marketing-campaign",
        status: ActionItemStatus.OPEN,
        priority: Priority.MEDIUM,
        dueDate: "2026-05-12T00:00:00.000Z"
      }
    ],
    notifications: [],
    auditLogs: [
      {
        id: "seed-audit-marketing-workspace",
        actorId: "seed-user-alex",
        action: AuditAction.WORKSPACE_CREATED,
        entityType: "Workspace",
        entityId: "seed-workspace-marketing",
        metadata: { seeded: true, label: "Marketing workspace" }
      }
    ]
  }
];

function milestoneStatus(progress) {
  if (progress >= 100) {
    return "COMPLETED";
  }

  if (progress > 0) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}

async function cleanup() {
  console.log("Cleaning up existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.actionItem.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.goalUpdate.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.workspaceInvite.deleteMany();
  await prisma.workspaceRolePermission.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleanup complete.");
}

async function upsertUser(user, passwordHash) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      id: user.id,
      name: user.name,
      passwordHash
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      passwordHash
    }
  });
}

async function upsertWorkspace(workspace) {
  return prisma.workspace.upsert({
    where: { slug: slugify(workspace.name) },
    update: {
      id: workspace.id,
      name: workspace.name,
      slug: slugify(workspace.name),
      description: workspace.description,
      accentColor: workspace.accentColor,
      ownerId: workspace.ownerId
    },
    create: {
      id: workspace.id,
      name: workspace.name,
      slug: slugify(workspace.name),
      description: workspace.description,
      accentColor: workspace.accentColor,
      ownerId: workspace.ownerId
    }
  });
}

async function upsertMemberships(workspace) {
  for (const member of workspace.members) {
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: member.userId,
          workspaceId: workspace.id
        }
      },
      update: {
        role: member.role
      },
      create: {
        userId: member.userId,
        workspaceId: workspace.id,
        role: member.role
      }
    });
  }
}

async function upsertGoals(workspace) {
  for (const goal of workspace.goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: {
        workspaceId: workspace.id,
        createdById: goal.createdById,
        assigneeId: goal.assigneeId,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        dueDate: new Date(goal.dueDate)
      },
      create: {
        id: goal.id,
        workspaceId: workspace.id,
        createdById: goal.createdById,
        assigneeId: goal.assigneeId,
        title: goal.title,
        description: goal.description,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        dueDate: new Date(goal.dueDate)
      }
    });

    for (const milestone of goal.milestones) {
      await prisma.milestone.upsert({
        where: { id: milestone.id },
        update: {
          goalId: goal.id,
          ownerId: milestone.ownerId,
          title: milestone.title,
          progress: milestone.progress,
          status: milestoneStatus(milestone.progress),
          priority: goal.priority
        },
        create: {
          id: milestone.id,
          goalId: goal.id,
          ownerId: milestone.ownerId,
          title: milestone.title,
          progress: milestone.progress,
          status: milestoneStatus(milestone.progress),
          priority: goal.priority
        }
      });
    }

    await prisma.goalUpdate.createMany({
      data: goal.updates.map((update) => ({
        id: update.id,
        goalId: goal.id,
        authorId: update.authorId,
        body: update.body
      })),
      skipDuplicates: true
    });
  }
}

async function upsertAnnouncements(workspace) {
  for (const announcement of workspace.announcements) {
    await prisma.announcement.upsert({
      where: { id: announcement.id },
      update: {
        workspaceId: workspace.id,
        authorId: announcement.authorId,
        title: announcement.title,
        body: announcement.body,
        pinned: announcement.pinned,
        publishedAt: new Date(announcement.publishedAt)
      },
      create: {
        id: announcement.id,
        workspaceId: workspace.id,
        authorId: announcement.authorId,
        title: announcement.title,
        body: announcement.body,
        pinned: announcement.pinned,
        publishedAt: new Date(announcement.publishedAt)
      }
    });

    await prisma.comment.createMany({
      data: announcement.comments.map((comment) => ({
        id: comment.id,
        workspaceId: workspace.id,
        authorId: comment.authorId,
        announcementId: announcement.id,
        body: comment.body
      })),
      skipDuplicates: true
    });

    await prisma.reaction.createMany({
      data: announcement.reactions.map((reaction) => ({
        id: reaction.id,
        workspaceId: workspace.id,
        userId: reaction.userId,
        announcementId: announcement.id,
        type: reaction.type
      })),
      skipDuplicates: true
    });
  }
}

async function upsertActionItems(workspace) {
  for (const actionItem of workspace.actionItems) {
    await prisma.actionItem.upsert({
      where: { id: actionItem.id },
      update: {
        workspaceId: workspace.id,
        createdById: workspace.ownerId,
        assigneeId: actionItem.assigneeId,
        goalId: actionItem.goalId,
        title: actionItem.title,
        description: actionItem.description,
        status: actionItem.status,
        priority: actionItem.priority,
        dueDate: new Date(actionItem.dueDate),
        completedAt: actionItem.completedAt ? new Date(actionItem.completedAt) : null
      },
      create: {
        id: actionItem.id,
        workspaceId: workspace.id,
        createdById: workspace.ownerId,
        assigneeId: actionItem.assigneeId,
        goalId: actionItem.goalId,
        title: actionItem.title,
        description: actionItem.description,
        status: actionItem.status,
        priority: actionItem.priority,
        dueDate: new Date(actionItem.dueDate),
        completedAt: actionItem.completedAt ? new Date(actionItem.completedAt) : null
      }
    });
  }
}

async function upsertNotifications(workspace) {
  await prisma.notification.createMany({
    data: workspace.notifications.map((notification) => ({
      id: notification.id,
      userId: notification.userId,
      workspaceId: workspace.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityId: notification.entityId
    })),
    skipDuplicates: true
  });
}

async function upsertAuditLogs(workspace) {
  await prisma.auditLog.createMany({
    data: workspace.auditLogs.map((auditLog) => ({
      id: auditLog.id,
      workspaceId: workspace.id,
      actorId: auditLog.actorId,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      metadata: auditLog.metadata
    })),
    skipDuplicates: true
  });
}

async function main() {
  await cleanup();
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  for (const user of users) {
    await upsertUser(user, passwordHash);
  }

  for (const workspace of workspaceBlueprints) {
    await upsertWorkspace(workspace);
    await upsertMemberships(workspace);
    await syncWorkspaceRolePermissions(prisma, workspace.id);
    await upsertGoals(workspace);
    await upsertAnnouncements(workspace);
    await upsertActionItems(workspace);
    await upsertNotifications(workspace);
    await upsertAuditLogs(workspace);
  }

  console.log("Seed complete");
  console.log("Demo credentials for all seeded users:");
  console.log(`Password: ${demoPassword}`);
  users.forEach((user) => {
    console.log(`- ${user.email}`);
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
