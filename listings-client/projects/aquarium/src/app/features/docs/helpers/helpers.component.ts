import { Component } from '@angular/core';
import { IconComponent } from '@fish-ui/components';

@Component({
  selector: 'app-helpers',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './helpers.component.html',
  styleUrl: './helpers.component.scss'
})
export class HelpersComponent {
  isVisible = true;

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }
}
