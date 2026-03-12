import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CLOUDINARY_CONFIG } from '../config/cloudinary.config';

/**
 * Servicio encargado de la subida asíncrona de archivos multimedia a Cloudinary.
 * 
 * Utiliza la configuración provista en `CLOUDINARY_CONFIG` para autenticar y 
 * subir imágenes (como avatares) directamente desde el navegador al CDN.
 */
@Injectable({
    providedIn: 'root'
})
export class CloudinaryService {
    /** @ignore */
    private readonly cloudName = CLOUDINARY_CONFIG.cloudName;
    
    /** @ignore */
    private readonly uploadPreset = CLOUDINARY_CONFIG.uploadPreset;

    /** @ignore */
    constructor(private http: HttpClient) { }

    /**
     * Sube un archivo de imagen a los servidores de Cloudinary usando el preset configurado.
     * 
     * @param file El archivo binario (`File`) seleccionado por el usuario.
     * @returns Un `Observable` que emite la URL segura (`secure_url`) pública de la imagen alojada.
     */
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
