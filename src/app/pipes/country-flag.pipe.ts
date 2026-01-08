import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'countryFlag',
    standalone: true
})
export class CountryFlagPipe implements PipeTransform {

    transform(isoCode: string): string {
        if (!isoCode) return '';
        return `https://flagcdn.com/w20/${isoCode.toLowerCase()}.png`;
    }

}
