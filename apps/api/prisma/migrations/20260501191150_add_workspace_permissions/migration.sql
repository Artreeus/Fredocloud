-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('CREATE_GOAL', 'UPDATE_GOAL', 'POST_ANNOUNCEMENT', 'PIN_ANNOUNCEMENT', 'INVITE_MEMBER', 'MANAGE_MEMBERS', 'CREATE_ACTION_ITEM', 'UPDATE_ACTION_ITEM', 'DELETE_CONTENT', 'MANAGE_WORKSPACE');

-- CreateTable
CREATE TABLE "WorkspaceRolePermission" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "permission" "Permission" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceRolePermission_workspaceId_role_idx" ON "WorkspaceRolePermission"("workspaceId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRolePermission_workspaceId_role_permission_key" ON "WorkspaceRolePermission"("workspaceId", "role", "permission");

-- AddForeignKey
ALTER TABLE "WorkspaceRolePermission" ADD CONSTRAINT "WorkspaceRolePermission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
