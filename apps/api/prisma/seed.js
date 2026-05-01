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
