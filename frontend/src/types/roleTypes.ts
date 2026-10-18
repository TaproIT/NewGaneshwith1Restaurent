export type UserRole = 'Super-Admin' | 'Admin' | 'Reception' | 'Restaurant-Staff' | 'Restaurant-Admin' | null;

export interface RoleState {
    role: UserRole;
    restaurantType: string;
}