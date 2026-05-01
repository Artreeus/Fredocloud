export function hasPermission(workspace, permission) {
  return Boolean(workspace?.permissions?.includes(permission));
}
