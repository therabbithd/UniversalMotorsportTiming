/**
 * Represents a user profile in the system.
 */
export interface Profile {
    /** Unique identifier for the profile */
    id?: number;
    /** Biography or description of the user */
    bio?: string;
    /** Phone number of the user */
    phone?: string;
    /** Address of the user */
    address?: string;
    /** URL or path to the user's avatar image */
    avatar?: string;
    /** JSON string or identifier for user settings/configuration */
    configuracion?: string;
    /** JSON string or identifier for user favorite items */
    favoritos?: string;
    /** Required ID linking to the main User entry */
    userId: number;
    /** Timestamp when the profile was created */
    createdAt?: string;
    /** Timestamp when the profile was last updated */
    updatedAt?: string;
}

/**
 * Input structure for creating or updating a user profile.
 */
export interface ProfileInput {
    /** Biography or description of the user */
    bio?: string;
    /** Phone number of the user */
    phone?: string;
    /** Address of the user */
    address?: string;
    /** URL or path to the user's avatar image */
    avatar?: string;
    /** JSON string or identifier for user settings/configuration */
    configuracion?: string;
    /** JSON string or identifier for user favorite items */
    favoritos?: string;
}
