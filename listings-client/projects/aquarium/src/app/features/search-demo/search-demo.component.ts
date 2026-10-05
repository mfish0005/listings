import { Component } from '@angular/core';
import { SearchComponent } from '@fish-ui/components';
import { SearchService, SearchItem } from './search.service';

@Component({
  selector: 'app-search-demo',
  imports: [SearchComponent],
  templateUrl: './search-demo.component.html',
  styleUrl: './search-demo.component.scss'
})
export class SearchDemoComponent {  
  searchQuery: string = '';
  nameSearchQuery: string = '';
  nameSearchResults: SearchItem[] = [];

  constructor(private searchService: SearchService) {}
  
  onSearch(query: string) {
    this.searchQuery = query;
  }

  onClear() {
    this.searchQuery = '';
  }
  
  onNameSearch(query: string) {
    this.nameSearchQuery = query;
    this.nameSearchResults = this.searchService.searchByName(query);
  }

  onNameClear() {
    this.nameSearchQuery = '';
    this.nameSearchResults = [];
  }

  getCategoryColor(category: string): string {
    return this.searchService.getCategoryColor(category);
  }
}
