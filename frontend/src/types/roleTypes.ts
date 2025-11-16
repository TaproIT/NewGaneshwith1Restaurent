export type UserRole = 'Super-Admin' | 'Admin' | 'Reception' | 'Beach-Restaurant-Staff' | 'Pool-Restaurant-Staff' | 'Pool-Restaurant-Admin'| 'Beach-Restaurant-Admin' | null;

export interface RoleState {
    role: UserRole;
    restaurantType: string;
}