import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { DeleteListingComponent } from './delete-listing.component';
import { ListingDeleteService } from './listing-delete.service';

describe('DeleteListingComponent', () => {
  let fixture: ComponentFixture<DeleteListingComponent>;
  let requests: Subject<void>[];
  let deletedIds: number[];
  let deletedEvents: number;

  const deleteService = {
    delete: (id: number): Observable<void> => {
      const request = new Subject<void>();
      deletedIds.push(id);
      requests.push(request);
      return request;
    }
  };

  function dialog(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog');
  }

  function button(label: string, root: ParentNode = fixture.nativeElement): HTMLButtonElement {
    const buttons = Array.from(root.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);

    return buttons.find(candidate => candidate.textContent?.trim() === label)!;
  }

  function askToDelete(): void {
    fixture.nativeElement.querySelector('fish-button button').click();
    fixture.detectChanges();
  }

  function confirmDeletion(): void {
    button('Delete', dialog()).click();
    fixture.detectChanges();
  }

  function cancelDialog(): void {
    button('Cancel', dialog()).click();
    fixture.detectChanges();
  }

  function finishRequest(): void {
    const request = requests[requests.length - 1];
    request.next();
    request.complete();
    fixture.detectChanges();
  }

  function failRequest(error: HttpErrorResponse): void {
    requests[requests.length - 1].error(error);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    requests = [];
    deletedIds = [];
    deletedEvents = 0;

    await TestBed.configureTestingModule({
      imports: [DeleteListingComponent],
      providers: [{ provide: ListingDeleteService, useValue: deleteService }]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteListingComponent);
    fixture.componentRef.setInput('listingId', 7);
    fixture.componentRef.setInput('address', '123 Main St');
    fixture.componentInstance.deleted.subscribe(() => deletedEvents++);
    fixture.detectChanges();
  });

  it('only shows a Delete button at first', () => {
    expect(button('Delete')).toBeDefined();
    expect(dialog().open).toBeFalse();
    expect(deletedIds).toEqual([]);
  });

  it('asks for confirmation naming the listing before deleting anything', () => {
    askToDelete();

    expect(dialog().open).toBeTrue();
    expect(dialog().textContent).toContain('Delete this listing?');
    expect(dialog().textContent).toContain('123 Main St');
    expect(deletedIds).toEqual([]);
  });

  it('does nothing when the confirmation is cancelled', () => {
    askToDelete();
    cancelDialog();

    expect(dialog().open).toBeFalse();
    expect(deletedIds).toEqual([]);
    expect(deletedEvents).toBe(0);
  });

  it('deletes the listing once confirmed and reports it', () => {
    askToDelete();
    confirmDeletion();

    expect(deletedIds).toEqual([7]);
    expect(deletedEvents).toBe(0);

    finishRequest();

    expect(deletedEvents).toBe(1);
    expect(dialog().open).toBeFalse();
  });

  it('shows progress and cannot be cancelled while deleting', () => {
    askToDelete();
    confirmDeletion();

    expect(button('Delete', dialog()).classList).toContain('fish-button--loading');
    expect(button('Cancel', dialog()).classList).toContain('fish-button--disabled');
  });

  it('treats a listing that is already gone as deleted', () => {
    askToDelete();
    confirmDeletion();
    failRequest(new HttpErrorResponse({ status: 404 }));

    expect(deletedEvents).toBe(1);
    expect(dialog().open).toBeFalse();
  });

  it('keeps the dialog open with the server message when deleting fails', () => {
    askToDelete();
    confirmDeletion();
    failRequest(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong', detail: 'The database is down.' } }));

    expect(dialog().open).toBeTrue();
    expect(dialog().querySelector('[role="alert"]')!.textContent).toContain('The database is down.');
    expect(deletedEvents).toBe(0);
  });

  it('explains when the API cannot be reached', () => {
    askToDelete();
    confirmDeletion();
    failRequest(new HttpErrorResponse({ status: 0 }));

    expect(dialog().querySelector('[role="alert"]')!.textContent).toContain('Could not reach the listing service');
  });

  it('can retry after a failure', () => {
    askToDelete();
    confirmDeletion();
    failRequest(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } }));

    confirmDeletion();
    finishRequest();

    expect(deletedIds).toEqual([7, 7]);
    expect(deletedEvents).toBe(1);
    expect(dialog().open).toBeFalse();
  });

  it('forgets an earlier failure when asked again', () => {
    askToDelete();
    confirmDeletion();
    failRequest(new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } }));
    cancelDialog();

    askToDelete();

    expect(dialog().querySelector('[role="alert"]')).toBeNull();
  });
});
