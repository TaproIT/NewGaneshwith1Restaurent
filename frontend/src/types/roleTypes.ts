export type UserRole = 'Super-Admin' | 'Admin' | 'Reception' | 'Beach-Restaurant-Staff' | 'Pool-Restaurant-Staff';

export interface RoleState {
    role: UserRole;
}