import { Component } from '@angular/core';
import { ButtonComponent } from '@fish-ui/components';

@Component({
  selector: 'app-button-demo',
  imports: [ButtonComponent],
  templateUrl: './button-demo.component.html',
  styleUrl: './button-demo.component.scss'
})
export class ButtonDemoComponent {
  onButtonClick(variant: string) {
    console.log(`${variant} button clicked!`);
  }
}
