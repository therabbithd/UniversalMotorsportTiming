import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: 'img[appImageFallback]',
    standalone: true
})
export class ImageFallbackDirective {
    // Path to the fallback image.
    // Usage: <img src="invalid.jpg" appImageFallback="assets/images/default-user.png">
    @Input() appImageFallback: string = '';

    constructor(private el: ElementRef) { }

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
