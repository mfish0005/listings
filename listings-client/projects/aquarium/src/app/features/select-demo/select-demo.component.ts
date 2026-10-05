import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent, SelectOption } from 'fish-ui';

@Component({
  selector: 'app-select-demo',
  standalone: true,
  imports: [CommonModule, SelectComponent],
  templateUrl: './select-demo.component.html',
  styleUrls: ['./select-demo.component.scss']
})
export class SelectDemoComponent {
  basicValue = signal('');
  variantValue = signal('');
  sizeValue = signal('');
  stateValue = signal('');
  disabledValue = signal('');
  errorValue = signal('');

  basicOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  fishOptions: SelectOption[] = [
    { value: 'betta', label: 'Betta' },
    { value: 'goldfish', label: 'Goldfish' },
    { value: 'oscar', label: 'Oscar' },
    { value: 'angel', label: 'Angelfish' },
    { value: 'pufferfish', label: 'Pufferfish' },
    { value: 'clownfish', label: 'Clownfish' }
  ];

  sizeOptions: SelectOption[] = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  variantOptions: SelectOption[] = [
    { value: 'default', label: 'Default' },
    { value: 'outline', label: 'Outline' },
    { value: 'filled', label: 'Filled' }
  ];

  stateOptions: SelectOption[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'error', label: 'Error' }
  ];

  disabledOptions: SelectOption[] = [
    { value: 'option1', label: 'Available Option' },
    { value: 'option2', label: 'Disabled Option', disabled: true },
    { value: 'option3', label: 'Another Available Option' }
  ];

  onBasicChange(value: string | number): void {
    this.basicValue.set(value as string);
  }

  onVariantChange(value: string | number): void {
    this.variantValue.set(value as string);
  }

  onSizeChange(value: string | number): void {
    this.sizeValue.set(value as string);
  }

  onStateChange(value: string | number): void {
    this.stateValue.set(value as string);
  }

  onDisabledChange(value: string | number): void {
    this.disabledValue.set(value as string);
  }

  onErrorChange(value: string | number): void {
    this.errorValue.set(value as string);
  }
}
