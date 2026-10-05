import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'fish-button',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  
  @Output() onClick = new EventEmitter<Event>();

  onButtonClick(event: Event) {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }

  get buttonClasses(): string {
    const classes = ['fish-button'];
        
    classes.push('is-inline-flex', 'is-flex-centered');
        
    classes.push('has-text-weight-normal');
        
    switch (this.size) {
      case 'small':
        classes.push('is-size-7');
        break;
      case 'medium':
        classes.push('is-size-6');
        break;
      case 'large':
        classes.push('is-size-5');
        break;
    }
    classes.push(`fish-button--${this.size}`);
        
    classes.push(`fish-button--${this.variant}`);
        
    if (this.disabled) classes.push('fish-button--disabled');
    if (this.loading) classes.push('fish-button--loading');
    if (this.fullWidth) classes.push('fish-button--full-width');
    
    return classes.join(' ');
  }

  get colorClasses(): string {
    const classes: string[] = [];
        
    switch (this.variant) {
      case 'primary':
        classes.push('has-background-primary', 'has-text-white');
        break;
      case 'secondary':
        classes.push('has-text-secondary');
        break;
      case 'success':
        classes.push('has-background-success', 'has-text-white');
        break;
      case 'warning':
        classes.push('has-background-warning', 'has-text-white');
        break;
      case 'danger':
        classes.push('has-background-danger', 'has-text-white');
        break;
      case 'info':
        classes.push('has-background-info', 'has-text-white');
        break;
      case 'ghost':        
        break;
    }
    
    return classes.join(' ');
  }
}
