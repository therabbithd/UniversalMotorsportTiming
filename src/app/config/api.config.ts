/**
 * Global configuration for API endpoints.
 */
export const API_CONFIG = {
  /** Base URL for the backend Node.js server */
  baseUrl: 'https://node-server-ut-lq2p.vercel.app',
  /** API Endpoint definitions */
  endpoints: {
    /** Authentication related endpoints */
    auth: {
      /** Endpoint for user registration */
      register: '/api/auth/register',
      /** Endpoint for user login */
      login: '/api/auth/login',
    },
    /** Endpoint for retrieving and updating user profiles */
    profile: '/api/profile',
  },
};

