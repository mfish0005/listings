import { ComponentFixture, TestBed } from '@angular/core/testing';
import { emptyFilters, ListingSearchFilters } from '../../models/listing-search-query.model';
import { ListingFiltersComponent } from './listing-filters.component';

describe('ListingFiltersComponent', () => {
  let fixture: ComponentFixture<ListingFiltersComponent>;
  let element: HTMLElement;
  let emitted: ListingSearchFilters[];

  function setFilters(filters: ListingSearchFilters): void {
    fixture.componentRef.setInput('filters', filters);
    fixture.detectChanges();
  }

  function inputFor(label: string): HTMLInputElement {
    const field = Array.from(element.querySelectorAll('label')).find(item => item.textContent?.includes(label));
    return field!.querySelector('input')!;
  }

  function type(label: string, value: string): void {
    const input = inputFor(label);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function clickButton(label: string): void {
    const button = Array.from(element.querySelectorAll('button')).find(item => item.textContent?.includes(label));
    button!.click();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListingFiltersComponent] }).compileComponents();

    fixture = TestBed.createComponent(ListingFiltersComponent);
    element = fixture.nativeElement;
    emitted = [];
    fixture.componentInstance.search.subscribe(filters => emitted.push(filters));
    setFilters(emptyFilters);
  });

  it('shows the filters it is given', () => {
    setFilters({ ...emptyFilters, city: 'Vienna', targetBudget: '450000' });

    expect(inputFor('City').value).toBe('Vienna');
    expect(inputFor('Target budget').value).toBe('450000');
  });

  it('emits what was typed when searching', () => {
    type('City', 'Fairfax');
    type('Min bedrooms', '3');

    clickButton('Search');

    expect(emitted).toEqual([{ ...emptyFilters, city: 'Fairfax', minBedrooms: '3' }]);
  });

  it('emits empty filters when cleared', () => {
    setFilters({ ...emptyFilters, city: 'Vienna' });

    clickButton('Clear');
    fixture.detectChanges();

    expect(emitted).toEqual([emptyFilters]);
    expect(inputFor('City').value).toBe('');
  });
});
