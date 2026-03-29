export enum Role {
  GUEST = 'guest',
  USER = 'user',
  SUBSCRIBER = 'subscriber',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.GUEST]: 0,
  [Role.USER]: 1,
  [Role.SUBSCRIBER]: 2,
  [Role.ADMIN]: 3,
  [Role.SUPERADMIN]: 4,
};
