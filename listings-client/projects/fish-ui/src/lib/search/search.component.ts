import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'fish-search',
  imports: [FormsModule, NgIf],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  @Input() placeholder: string = 'Search...';

  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  searchValue: string = '';

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newValue = target.value;
    this.searchValue = newValue;
    this.search.emit(newValue);
  }

  onClear() {
    this.searchValue = '';
    this.clear.emit();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClear();
    }
  }
}
