import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from 'fish-ui';

@Component({
  selector: 'app-pagination-demo',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './pagination-demo.component.html',
  styleUrls: ['./pagination-demo.component.scss']
})
export class PaginationDemoComponent {
  basicPage = signal(1);
  manyPage = signal(10);
  siblingPage = signal(15);
  disabledPage = signal(2);
  singlePage = signal(1);
}
