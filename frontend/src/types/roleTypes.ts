export type UserRole = 'Super-Admin' | 'Admin' | 'Reception' | 'Beach-Restaurant-Staff' | 'Pool-Restaurant-Staff' | null;

export interface RoleState {
    role: UserRole;
    restaurantType: string;
}