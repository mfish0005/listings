import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { buildPageItems, PageItem } from './pagination.utils';

@Component({
  selector: 'fish-pagination',
  imports: [IconComponent],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() totalPages = 1;
  @Input() siblingCount = 1;
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();

  get items(): PageItem[] {
    return buildPageItems(this.page, this.totalPages, this.siblingCount);
  }

  get hasPrevious(): boolean {
    return this.page > 1;
  }

  get hasNext(): boolean {
    return this.page < this.totalPages;
  }

  goTo(page: number): void {
    const inRange = page >= 1 && page <= this.totalPages;

    if (this.disabled || !inRange || page === this.page) {
      return;
    }

    this.pageChange.emit(page);
  }
}
