import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [open]="open()"
      heading="Delete this?"
      confirmLabel="Delete"
      confirmVariant="danger"
      [busy]="busy()"
      [error]="error()"
      (confirmed)="confirmed = confirmed + 1"
      (dismissed)="dismissed = dismissed + 1"
    >
      <p class="message">This cannot be undone.</p>
    </app-confirm-dialog>
  `
})
class HostComponent {
  readonly open = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);
  confirmed = 0;
  dismissed = 0;
}

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  function dialog(): HTMLDialogElement {
    return fixture.nativeElement.querySelector('dialog');
  }

  function button(label: string): HTMLButtonElement {
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);

    return buttons.find(candidate => candidate.textContent?.trim() === label)!;
  }

  function setOpen(open: boolean): void {
    host.open.set(open);
    fixture.detectChanges();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('is closed until it is opened', () => {
    expect(dialog().open).toBeFalse();
  });

  it('opens as a modal and closes again', () => {
    setOpen(true);
    expect(dialog().open).toBeTrue();
    expect(dialog().matches(':modal')).toBeTrue();

    setOpen(false);
    expect(dialog().open).toBeFalse();
  });

  it('shows the heading and the projected message', () => {
    expect(dialog().getAttribute('aria-label')).toBe('Delete this?');
    expect(dialog().textContent).toContain('Delete this?');
    expect(dialog().querySelector('.message')!.textContent).toContain('This cannot be undone.');
  });

  it('reports a confirmation', () => {
    setOpen(true);

    button('Delete').click();

    expect(host.confirmed).toBe(1);
    expect(host.dismissed).toBe(0);
  });

  it('reports a dismissal from the cancel button', () => {
    setOpen(true);

    button('Cancel').click();

    expect(host.dismissed).toBe(1);
    expect(host.confirmed).toBe(0);
  });

  it('reports a dismissal when Escape is pressed, and stays open until told to close', () => {
    setOpen(true);

    const event = new Event('cancel', { cancelable: true });
    dialog().dispatchEvent(event);

    expect(host.dismissed).toBe(1);
    expect(event.defaultPrevented).toBeTrue();
    expect(dialog().open).toBeTrue();
  });

  it('ignores Escape and blocks cancelling while busy', () => {
    setOpen(true);
    host.busy.set(true);
    fixture.detectChanges();

    dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    button('Cancel').click();

    expect(host.dismissed).toBe(0);
    expect(button('Delete').classList).toContain('fish-button--loading');
  });

  it('shows an error message', () => {
    expect(dialog().querySelector('[role="alert"]')).toBeNull();

    host.error.set('Could not delete.');
    fixture.detectChanges();

    expect(dialog().querySelector('[role="alert"]')!.textContent).toContain('Could not delete.');
  });

  it('uses the requested button variant for the confirm action', () => {
    expect(button('Delete').classList).toContain('fish-button--danger');
  });
});
