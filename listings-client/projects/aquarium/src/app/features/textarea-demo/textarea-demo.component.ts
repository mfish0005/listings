import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TextareaComponent } from 'fish-ui';
import { ButtonComponent } from 'fish-ui';

@Component({
  selector: 'app-textarea-demo',
  standalone: true,
  imports: [CommonModule, TextareaComponent, ButtonComponent, ReactiveFormsModule],
  templateUrl: './textarea-demo.component.html',
  styleUrl: './textarea-demo.component.scss'
})
export class TextareaDemoComponent {  
  basicTextareaValue = signal('');
  form = signal<FormGroup | null>(null);
  submitted = signal(false);
  formData = signal<any>(null);

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm() {
    this.form.set(this.fb.group({
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      comments: ['', [Validators.maxLength(1000)]],
      description: ['', [Validators.required, Validators.minLength(20)]]
    }));
  }

  onBasicTextareaChange(value: string) {
    this.basicTextareaValue.set(value);
  }

  onTextareaClick(variant: string) {
    console.log(`${variant} textarea clicked`);
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
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be at most ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}

