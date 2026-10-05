import { Component, Input, Output, EventEmitter, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export type TextareaVariant = 'default' | 'success' | 'warning' | 'danger';
export type TextareaSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'fish-textarea',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true
    }
  ]
})
export class TextareaComponent implements ControlValueAccessor {
  
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;
  @Input() required: boolean = false;
  @Input() variant: TextareaVariant = 'default';
  @Input() size: TextareaSize = 'medium';
  @Input() rows: number = 3;
  @Input() maxLength: number | null = null;
  @Input() minLength: number | null = null;
  @Input() resize: 'none' | 'both' | 'horizontal' | 'vertical' = 'vertical';
  @Input() value: string = '';
    
  @Output() valueChange = new EventEmitter<string>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  @Output() input = new EventEmitter<Event>();
  
  private _value = signal<string>('');
  private _touched = signal<boolean>(false);
  private _focused = signal<boolean>(false);

  protected readonly internalValue = this._value;
  protected readonly touched = this._touched;
  protected readonly focused = this._focused;
  
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  writeValue(value: string): void {
    this._value.set(value || '');
    this.value = value || '';
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    const newValue = target.value;

    this._value.set(newValue);
    this.value = newValue;
    this.onChange(newValue);
    this.valueChange.emit(newValue);
    this.input.emit(event);
  }
  
  onFocus(event: FocusEvent): void {
    this._focused.set(true);
    this.focus.emit(event);
  }
  
  onBlur(event: FocusEvent): void {
    this._focused.set(false);
    this._touched.set(true);
    this.onTouched();
    this.blur.emit(event);
  }
    
  protected get hasError(): boolean {
    return this.touched() && this.required && !this.internalValue();
  }
  
  protected get textareaClasses(): string {
    const classes = ['fish-textarea'];
        
    classes.push(`fish-textarea--${this.size}`);
        
    if (this.hasError) {
      classes.push('fish-textarea--danger');
    } else {
      classes.push(`fish-textarea--${this.variant}`);
    }
        
    if (this.disabled) classes.push('fish-textarea--disabled');
    if (this.readonly) classes.push('fish-textarea--readonly');
    if (this.focused()) classes.push('fish-textarea--focused');
    
    return classes.join(' ');
  }
  
  protected get resizeStyle(): string {
    return this.resize;
  }
}
