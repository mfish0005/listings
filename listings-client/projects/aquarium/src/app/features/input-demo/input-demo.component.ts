import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from 'fish-ui';
import { ButtonComponent } from 'fish-ui';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './input-demo.component.html',
  styleUrl: './input-demo.component.scss'
})
export class InputDemoComponent {  
  basicInputValue = signal('');

  form = signal<FormGroup | null>(null);

  submitted = signal(false);
  formData = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm() {
    this.form.set(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      website: ['', [Validators.pattern(/^https?:\/\/.+/)]]
    }));
  }

  onBasicInputChange(value: string) {
    this.basicInputValue.set(value);
  }

  onInputClick(variant: string) {
    console.log(`${variant} input clicked`);
  }

  onSubmit() {
    if (this.form()?.valid) {
      this.submitted.set(true);
      this.formData.set(this.form()?.value);
    }
  }

  onReset() {
    this.form()?.reset();
    this.submitted.set(false);
    this.formData.set(null);
  }

  getFieldError(fieldName: string): string {
    const field = this.form()?.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${fieldName} must be at most ${field.errors['max'].max}`;
      if (field.errors['pattern']) return 'Please enter a valid URL';
    }
    return '';
  }
}
