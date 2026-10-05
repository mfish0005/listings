import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-theming',
  imports: [RouterLink],
  templateUrl: './theming.component.html',
  styleUrl: './theming.component.scss'
})
export class ThemingComponent {
  constructor() {}
}
