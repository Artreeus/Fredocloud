const bcrypt = require("bcryptjs");
const { slugify } = require("@repo/utils");
const { AuditAction, PrismaClient, WorkspaceRole } = require("../generated/prisma");

const prisma = new PrismaClient();

async function main() {
  const demoEmail = "demo@fredocloud.com";
  const demoPassword = "Demo@12345";
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Demo User",
      passwordHash
    },
    create: {
      email: demoEmail,
      name: "Demo User",
      passwordHash
    }
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: slugify("Demo Workspace") },
    update: {
      ownerId: demoUser.id,
      name: "Demo Workspace"
    },
    create: {
      ownerId: demoUser.id,
      name: "Demo Workspace",
      slug: slugify("Demo Workspace"),
      description: "Seeded workspace for milestone verification.",
      accentColor: "#2745f2"
    }
  });

  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: demoUser.id,
        workspaceId: workspace.id
      }
    },
    update: {
      role: WorkspaceRole.OWNER
    },
    create: {
      userId: demoUser.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.OWNER
    }
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      actorId: demoUser.id,
      action: AuditAction.USER_REGISTERED,
      entityType: "User",
      entityId: demoUser.id,
      metadata: {
        seeded: true
      }
    }
  });

  const demoGoal = await prisma.goal.upsert({
    where: {
      id: "demo-goal-seeded"
    },
    update: {
      title: "Launch collaborative team hub MVP",
      description: "Coordinate the initial release of the team hub experience.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 50,
      dueDate: new Date("2026-05-20T00:00:00.000Z"),
      workspaceId: workspace.id,
      createdById: demoUser.id,
      assigneeId: demoUser.id
    },
    create: {
      id: "demo-goal-seeded",
      title: "Launch collaborative team hub MVP",
      description: "Coordinate the initial release of the team hub experience.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 50,
      dueDate: new Date("2026-05-20T00:00:00.000Z"),
      workspaceId: workspace.id,
      createdById: demoUser.id,
      assigneeId: demoUser.id
    }
  });

  const seededMilestones = [
    {
      id: "demo-milestone-wireframes",
      title: "Finalize workspace flows",
      progress: 100
    },
    {
      id: "demo-milestone-api",
      title: "Ship goals API",
      progress: 50
    },
    {
      id: "demo-milestone-ui",
      title: "Polish goals interface",
      progress: 0
    }
  ];

  for (const milestone of seededMilestones) {
    await prisma.milestone.upsert({
      where: { id: milestone.id },
      update: {
        title: milestone.title,
        progress: milestone.progress,
        status:
          milestone.progress >= 100
            ? "COMPLETED"
            : milestone.progress > 0
              ? "IN_PROGRESS"
              : "NOT_STARTED",
        goalId: demoGoal.id,
        ownerId: demoUser.id
      },
      create: {
        id: milestone.id,
        title: milestone.title,
        progress: milestone.progress,
        status:
          milestone.progress >= 100
            ? "COMPLETED"
            : milestone.progress > 0
              ? "IN_PROGRESS"
              : "NOT_STARTED",
        goalId: demoGoal.id,
        ownerId: demoUser.id
      }
    });
  }

  await prisma.goalUpdate.createMany({
    data: [
      {
        id: "demo-update-kickoff",
        goalId: demoGoal.id,
        authorId: demoUser.id,
        body: "Kickoff complete. Workspace and auth milestones are ready for the next sprint."
      }
    ],
    skipDuplicates: true
  });

  const seededActionItems = [
    {
      id: "demo-action-item-board",
      title: "Review team dashboard copy",
      description: "Tighten the dashboard messaging before the next internal demo.",
      status: "OPEN",
      priority: "HIGH",
      dueDate: new Date("2026-05-06T00:00:00.000Z")
    },
    {
      id: "demo-action-item-api",
      title: "Wire action item filters",
      description: "Support assignee, priority, status, goal, and overdue filters.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      dueDate: new Date("2026-05-03T00:00:00.000Z")
    },
    {
      id: "demo-action-item-done",
      title: "Confirm goal linkage",
      description: "Make sure linked goal names are visible on task cards and rows.",
      status: "DONE",
      priority: "MEDIUM",
      dueDate: new Date("2026-04-30T00:00:00.000Z")
    }
  ];

  for (const actionItem of seededActionItems) {
    await prisma.actionItem.upsert({
      where: { id: actionItem.id },
      update: {
        workspaceId: workspace.id,
        createdById: demoUser.id,
        assigneeId: demoUser.id,
        goalId: demoGoal.id,
        title: actionItem.title,
        description: actionItem.description,
        priority: actionItem.priority,
        status: actionItem.status,
        dueDate: actionItem.dueDate,
        completedAt: actionItem.status === "DONE" ? new Date("2026-04-29T00:00:00.000Z") : null
      },
      create: {
        id: actionItem.id,
        workspaceId: workspace.id,
        createdById: demoUser.id,
        assigneeId: demoUser.id,
        goalId: demoGoal.id,
        title: actionItem.title,
        description: actionItem.description,
        priority: actionItem.priority,
        status: actionItem.status,
        dueDate: actionItem.dueDate,
        completedAt: actionItem.status === "DONE" ? new Date("2026-04-29T00:00:00.000Z") : null
      }
    });
  }

  console.log("Seed complete");
  console.log(`Demo email: ${demoEmail}`);
  console.log(`Demo password: ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
