import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Profile, ProfileInput } from '../models/profile.model';

/**
 * Servicio para la gestión del perfil del usuario autenticado.
 * 
 * Permite obtener, crear y actualizar los datos del perfil (nombre de usuario, preferencias, etc.)
 * interactuando con la API y manejando automáticamente el token de autorización.
 */
@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    /** Injected HttpClient for API requests */
    private readonly http = inject(HttpClient);

    /**
     * Construye las cabeceras HTTP incluyendo el token de autorización JWT.
     * 
     * @returns Un objeto `HttpHeaders` listo para usar en las peticiones HttpClient.
     */
    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    /**
     * Recupera el perfil del usuario actual (el que tiene sesión iniciada).
     * 
     * @returns Un `Observable` con los datos del `Profile`.
     */
    getProfile(): Observable<Profile> {
        return this.http.get<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}/me`, {
            headers: this.getHeaders(),
        });
    }

    /**
     * Crea un perfil nuevo para el usuario, utilizado durante el flujo inicial (Setup Profile).
     * 
     * @param data Objeto con los datos base del nuevo perfil (`ProfileInput`).
     * @returns Un `Observable` que emite el perfil creado por el servidor.
     */
    createProfile(data: ProfileInput): Observable<Profile> {
        return this.http.post<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}`, data, {
            headers: this.getHeaders(),
        });
    }

    /**
     * Actualiza información parcial o total del perfil del usuario logueado.
     * 
     * @param data Los campos a modificar (`ProfileInput`). 
     * @returns Un `Observable` que emite el perfil resultante tras la actualización.
     */
    updateProfile(data: ProfileInput): Observable<Profile> {
        return this.http.patch<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}/me`, data, {
            headers: this.getHeaders(),
        });
    }
}
