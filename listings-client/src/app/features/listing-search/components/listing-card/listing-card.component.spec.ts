import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createListing } from '../../testing/listing-factory';
import { Listing } from '../../models/listing.model';
import { ListingCardComponent } from './listing-card.component';

describe('ListingCardComponent', () => {
  let fixture: ComponentFixture<ListingCardComponent>;

  function render(listing: Listing): string {
    fixture.componentRef.setInput('listing', listing);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ListingCardComponent] }).compileComponents();
    fixture = TestBed.createComponent(ListingCardComponent);
  });

  it('shows the key listing details', () => {
    const text = render(createListing({ price: 1250000, sqft: 2100, relevanceScore: 0.8349 }));

    expect(text).toContain('123 Main St');
    expect(text).toContain('Springfield, VA 22150');
    expect(text).toContain('$1,250,000');
    expect(text).toContain('2,100 sqft');
    expect(text).toContain('Score 0.83');
    expect(text).toContain('MLS_A');
  });

  it('marks active listings as success and others as warning', () => {
    render(createListing({ status: 'active' }));
    expect(fixture.nativeElement.querySelector('.fish-badge--success')).not.toBeNull();

    render(createListing({ status: 'pending' }));
    expect(fixture.nativeElement.querySelector('.fish-badge--warning')).not.toBeNull();
  });
});
