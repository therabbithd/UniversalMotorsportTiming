export interface Profile {
    id?: number;
    bio?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    configuracion?: string;
    favoritos?: string;
    userId: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfileInput {
    bio?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    configuracion?: string;
    favoritos?: string;
}
