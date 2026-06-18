import { OrgRole } from '../types';
import { config } from '@grafana/runtime';

export function hasRole(role: OrgRole) {
  const orgRole = config.bootData.user.orgRole as string;

  switch (role) {
    case OrgRole.ADMIN:
      return orgRole === OrgRole.ADMIN;
    case OrgRole.EDITOR:
      return orgRole === OrgRole.ADMIN || orgRole === OrgRole.EDITOR;
    case OrgRole.VIEWER:
      return orgRole === OrgRole.ADMIN || orgRole === OrgRole.EDITOR || orgRole === OrgRole.VIEWER;
    default:
      return false;
  }
}

export function isLight() {
  return Boolean(config.theme2?.isLight);
}
