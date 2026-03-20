import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Router } from '@angular/router';

/** Data structure for user registration (account creation). */
export interface RegisterInput {
  /** User's email address */
  email: string;
  /** User's full name */
  name: string;
  /** User's password (min 8 chars) */
  password: string;
}

/** Data structure for user login credentials. */
export interface LoginInput {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/** Basic user model returned by the API. */
export interface User {
  /** Unique user identifier */
  id: number;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
  /** ISO date string of account creation */
  createdAt: string;
}

/** API response structure after successful registration or login. */
export interface AuthResponse {
  /** Authenticated user details */
  user: User;
  /** JWT access token for subsequent API requests */
  token: string;
}

/**
 * Centralized service to manage user authentication.
 * 
 * Handles registration, login, logout, and reactive management of the 
 * current user, as well as storing and retrieving the JWT token in `localStorage`.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** @ignore */
  private readonly http = inject(HttpClient);
  
  /** @ignore */
  private readonly router = inject(Router);

  /** 
   * Reactive signal (Angular Signals) that holds the global state of the logged-in user.
   */
  readonly currentUser = signal<User | null>(this.getUserFromStorage());

  /**
   * Registers a new account by sending data to the API.
   * Updates the authentication state upon success.
   * 
   * @param data Registration data (`RegisterInput`).
   * @returns An `Observable` with the response (`AuthResponse`).
   */
  register(data: RegisterInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`,
      data
    ).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  /**
   * Logs into the platform with email and password.
   * 
   * @param data Credentials (`LoginInput`).
   * @returns An `Observable` with the response (`AuthResponse`), triggering
   * internal login via `tap()`.
   */
  login(data: LoginInput): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`,
      data
    ).pipe(
      tap(response => this.setAuthState(response))
    );
  }

  /**
   * Ends the current session.
   * Removes tokens and data from `localStorage`, clears the signal, and navigates to the login screen.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Synchronously checks if a valid local session exists.
   * 
   * @returns `true` if a token exists in `localStorage`, otherwise `false`.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Persists the authentication state (token and user) to local storage.
   * @param response The auth response containing user and token
   */
  private setAuthState(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  /**
   * Retrieves the user data from local storage if it exists.
   * @returns The User object or null if not found/invalid
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}

