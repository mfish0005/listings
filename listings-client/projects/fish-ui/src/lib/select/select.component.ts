import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectOption } from './select.types';

@Component({
  selector: 'fish-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() variant: 'default' | 'outline' | 'filled' = 'default';
  @Input() error: boolean = false;
  @Input() errorMessage: string = '';

  @Output() selectionChange = new EventEmitter<string | number>();
  @Output() openedChange = new EventEmitter<boolean>();

  internalValue = signal<string | number>('');
  isOpen = signal(false);
  selectedOption = signal<SelectOption | null>(null);

  private onChange = (value: string | number) => {};
  private onTouched = () => {};

  writeValue(value: string | number): void {
    this.internalValue.set(value);
    this.updateSelectedOption();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.internalValue.set(value);
    this.updateSelectedOption();
    this.onChange(value);
    this.selectionChange.emit(value);
  }

  onFocus(): void {
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }

  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
      this.openedChange.emit(this.isOpen());
    }
  }

  selectOption(option: SelectOption): void {
    if (!option.disabled) {
      this.internalValue.set(option.value);
      this.selectedOption.set(option);
      this.isOpen.set(false);
      this.onChange(option.value);
      this.selectionChange.emit(option.value);
      this.openedChange.emit(false);
    }
  }

  private updateSelectedOption(): void {
    const option = this.options.find(opt => opt.value === this.internalValue());
    this.selectedOption.set(option || null);
  }

  get displayValue(): string {
    return this.selectedOption()?.label || this.placeholder;
  }

  get hasError(): boolean {
    return this.error && !!this.errorMessage;
  }
}
