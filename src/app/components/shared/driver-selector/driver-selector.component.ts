import { Component, forwardRef, inject, signal, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { F1CalendarService, Driver } from '../../../services/f1-calendar.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-driver-selector',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    template: `
    <div class="driver-selector-container">
      <select 
        [disabled]="disabled()" 
        (change)="onSelect($event)" 
        class="driver-select"
        [value]="value()"
      >
        <option value="" disabled selected>{{ 'AUTH.PROFILE.SETUP.SELECT_DRIVER' | translate }}</option>
        <option *ngFor="let driver of drivers()" [value]="driver.code">
          {{ driver.givenName }} {{ driver.familyName }} ({{ driver.code }})
        </option>
      </select>
    </div>
  `,
    styles: [`
    .driver-selector-container {
      width: 100%;
    }
    .driver-select {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: white;
      font-size: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='Length 19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;

      &:focus {
        outline: none;
        border-color: #e10600;
        background-color: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 4px rgba(225, 6, 0, 0.1);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      option {
        background-color: #1a1a1a;
        color: white;
      }
    }
  `],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DriverSelectorComponent),
            multi: true
        }
    ]
})
export class DriverSelectorComponent implements ControlValueAccessor, OnInit {
    private readonly f1Service = inject(F1CalendarService);

    readonly drivers = signal<Driver[]>([]);
    readonly value = signal<string>('');
    readonly disabled = signal<boolean>(false);

    onChange: any = () => { };
    onTouched: any = () => { };

    ngOnInit(): void {
        this.f1Service.getDrivers().subscribe(drivers => {
            this.drivers.set(drivers);
        });
    }

    onSelect(event: any): void {
        const val = event.target.value;
        this.value.set(val);
        this.onChange(val);
        this.onTouched();
    }

    // ControlValueAccessor methods
    writeValue(value: any): void {
        this.value.set(value || '');
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
    }
}
