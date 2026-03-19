import { Directive, ElementRef, HostListener, Input } from '@angular/core';

/**
 * Directive that provides a fallback image mechanism for `<img>` tags.
 * If the original image source fails to load, it will be replaced by the provided fallback URL
 * or a default placeholder.
 */
@Directive({
    selector: 'img[appImageFallback]',
    standalone: true
})
export class ImageFallbackDirective {
    /**
     * URL path to the fallback image.
     * Usage: `<img src="invalid.jpg" appImageFallback="assets/images/default-user.png">`
     */
    @Input() appImageFallback: string = '';

    /**
     * Initializes the ImageFallbackDirective.
     * @param el Reference to the host HTMLImageElement
     */
    constructor(private el: ElementRef) { }

    /**
     * Listens for the 'error' event on the host image element.
     * Replaces the broken source with the fallback image URL or a default placeholder.
     */
    @HostListener('error')
    onError() {
        if (this.appImageFallback) {
            this.el.nativeElement.src = this.appImageFallback;
        } else {
            // Simple fallback if none provided: transparent pixel or you could hardcode a local asset
            // this.el.nativeElement.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

            // Or better yet, just hide it to avoid "broken image" icon if that's preferred, 
            // but often a placeholder is wanted. 
            // Let's assume we want to alert the dev in console or just do nothing if no fallback provided?
            // Let's set a safe default.
            this.el.nativeElement.src = 'https://placehold.co/150?text=No+Image';
        }
    }
}
