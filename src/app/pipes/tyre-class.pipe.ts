import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tyreClass',
    standalone: true
})
export class TyreClassPipe implements PipeTransform {

    transform(compound: string): string {
        if (!compound) return '';
        const compoundLower = compound.toLowerCase();
        return `tyre-${compoundLower}`;
    }

}
