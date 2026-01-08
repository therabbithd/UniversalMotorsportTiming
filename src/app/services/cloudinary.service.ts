import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CLOUDINARY_CONFIG } from '../config/cloudinary.config';

@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    private readonly cloudName = CLOUDINARY_CONFIG.cloudName;
    private readonly uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

    constructor(private http: HttpClient) { }

    uploadImage(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

        return this.http.post<any>(url, formData).pipe(
            map(response => response.secure_url)
        );
    }
}
