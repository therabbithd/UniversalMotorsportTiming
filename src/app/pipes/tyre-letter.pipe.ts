import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tyreLetter',
    standalone: true
})
export class TyreLetterPipe implements PipeTransform {

    transform(compound: string): string {
        if (!compound) return '';
        return compound.charAt(0).toUpperCase();
    }

}
