import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Router } from '@angular/router';

/** Interface para los datos de registro (creación de cuenta). */
export interface RegisterInput {
  email: string;
  name: string;
  password: string;
}

/** Interface para los credenciales de inicio de sesión. */
export interface LoginInput {
  email: string;
  password: string;
}

/** Modelo básico del usuario devuelto por la API. */
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}

/** Respuesta de la API tras un registro o inicio de sesión exitoso. */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Servicio centralizado para gestionar la autenticación de usuarios.
 * 
 * Se ocupa del registro, inicio de sesión, cierre de sesión y la
 * gestión reactiva del usuario actual, además de almacenar y retrieving 
 * el token JWT en `localStorage`.
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
   * Señal reactiva (Angular Signals) que retiene el estado global del usuario logueado en toda la App.
   */
  readonly currentUser = signal<User | null>(this.getUserFromStorage());

  /**
   * Registra una cuenta nueva enviando los datos a la API.
   * Modifica el estado de autenticación al tener éxito.
   * 
   * @param data Datos de registro (`RegisterInput`).
   * @returns Un `Observable` con la respuesta (`AuthResponse`).
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
   * Inicia sesión en la plataforma con email y contraseña.
   * 
   * @param data Credenciales (`LoginInput`).
   * @returns Un `Observable` con la respuesta (`AuthResponse`), desencadenando
   * el login interno vía `tap()`.
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
   * Finaliza la sesión actual.
   * Elimina tokens y datos de `localStorage`, actualiza y vacía la señal y navega a la pantalla de login.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba de manera síncrona y rápida si existe una sesión válida localmente.
   * 
   * @returns `true` si hay token en `localStorage`, de lo contrario `false`.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private setAuthState(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

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

