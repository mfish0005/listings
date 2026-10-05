import { Component } from '@angular/core';
import { IconComponent } from '@fish-ui/components';

@Component({
  selector: 'app-overview',
  imports: [IconComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent {
  readonly version = '1.0.0';
}
