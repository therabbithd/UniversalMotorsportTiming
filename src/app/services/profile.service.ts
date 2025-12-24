import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Profile, ProfileInput } from '../models/profile.model';

@Injectable({
    providedIn: 'root',
})
export class ProfileService {
    private readonly http = inject(HttpClient);

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        });
    }

    getProfile(): Observable<Profile> {
        return this.http.get<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}/me`, {
            headers: this.getHeaders(),
        });
    }

    createProfile(data: ProfileInput): Observable<Profile> {
        return this.http.post<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}`, data, {
            headers: this.getHeaders(),
        });
    }

    updateProfile(data: ProfileInput): Observable<Profile> {
        return this.http.patch<Profile>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.profile}/me`, data, {
            headers: this.getHeaders(),
        });
    }
}
