import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { EMPTY } from 'rxjs';
import { DeleteListingComponent } from '../../../../shared/listing-delete/delete-listing.component';
import { ListingDeleteService } from '../../../../shared/listing-delete/listing-delete.service';
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
    await TestBed.configureTestingModule({
      imports: [ListingCardComponent],
      providers: [provideRouter([]), { provide: ListingDeleteService, useValue: { delete: () => EMPTY } }]
    }).compileComponents();
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

  it('links the address and a view details link to the listing page', () => {
    render(createListing({ id: 42 }));

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')) as HTMLAnchorElement[];
    expect(links.length).toBe(3);
    expect(links[0].getAttribute('href')).toBe('/listings/42');
    expect(links[0].textContent).toContain('123 Main St');
    expect(links[1].getAttribute('href')).toBe('/listings/42');
    expect(links[1].textContent).toContain('View details');
  });

  it('says nothing about other feeds when the home is listed once', () => {
    const text = render(createListing());

    expect(text).not.toContain('Also listed by');
  });

  it('shows where else the home is listed, linking to each listing', () => {
    const text = render(createListing({
      alsoListedBy: [
        { id: 7, source: 'MLS_B', externalId: 'B7', price: 452000, listedDate: '2026-08-27' },
        { id: 9, source: 'MLS_C', externalId: 'C3', price: 449500, listedDate: '2026-08-20' }
      ]
    }));

    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.listing-card__other')) as HTMLAnchorElement[];

    expect(text).toContain('Also listed by');
    expect(links.map(link => link.textContent?.trim())).toEqual(['MLS_B at $452,000', 'MLS_C at $449,500']);
    expect(links.map(link => link.getAttribute('href'))).toEqual(['/listings/7', '/listings/9']);
  });

  it('links to the edit page for the listing', () => {
    render(createListing({ id: 42 }));

    const edit = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a')).find(
      link => link.textContent?.trim() === 'Edit'
    ) as HTMLAnchorElement;

    expect(edit.getAttribute('href')).toBe('/listings/42/edit');
  });

  it('offers to delete the listing, naming it in the confirmation', () => {
    render(createListing({ id: 42, address: '9 Elm Ct' }));

    const deleteListing = fixture.debugElement.query(By.directive(DeleteListingComponent)).componentInstance as DeleteListingComponent;

    expect(deleteListing.listingId()).toBe(42);
    expect(deleteListing.address()).toBe('9 Elm Ct');
  });

  it('reports when the listing has been deleted', () => {
    render(createListing());
    let deleted = 0;
    fixture.componentInstance.deleted.subscribe(() => deleted++);

    fixture.debugElement.query(By.directive(DeleteListingComponent)).componentInstance.deleted.emit();

    expect(deleted).toBe(1);
  });

  it('marks active listings as success and others as warning', () => {
    render(createListing({ status: 'active' }));
    expect(fixture.nativeElement.querySelector('.fish-badge--success')).not.toBeNull();

    render(createListing({ status: 'pending' }));
    expect(fixture.nativeElement.querySelector('.fish-badge--warning')).not.toBeNull();
  });
});
