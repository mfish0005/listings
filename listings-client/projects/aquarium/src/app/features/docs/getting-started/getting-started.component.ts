import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@fish-ui/components';

@Component({
  selector: 'app-getting-started',
  imports: [RouterLink, IconComponent],
  templateUrl: './getting-started.component.html',
  styleUrl: './getting-started.component.scss'
})
export class GettingStartedComponent {
  constructor() {}
}
