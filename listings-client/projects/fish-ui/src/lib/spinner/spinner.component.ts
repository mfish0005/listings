import { Component, Input } from '@angular/core';

export type SpinnerSize = 'small' | 'medium' | 'large' | 'extra-large';
export type SpinnerVariant = 'primary' | 'secondary' | 'white';

@Component({
  selector: 'fish-spinner',
  imports: [],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss'
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'medium';
  @Input() variant: SpinnerVariant = 'primary';
  @Input() label = 'Loading...';

  get spinnerClasses(): string {
    const classes = ['fish-spinner'];
    
    classes.push(`fish-spinner--${this.size}`);
    classes.push(`fish-spinner--${this.variant}`);
    
    return classes.join(' ');
  }
}
