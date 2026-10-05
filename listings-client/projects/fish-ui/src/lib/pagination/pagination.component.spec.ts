import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;
  let element: HTMLElement;
  let emittedPages: number[];

  function configure(page: number, totalPages: number, disabled = false): void {
    fixture.componentRef.setInput('page', page);
    fixture.componentRef.setInput('totalPages', totalPages);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.detectChanges();
  }

  function button(label: string): HTMLButtonElement {
    return element.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PaginationComponent] }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    emittedPages = [];
    component.pageChange.subscribe((page: number) => emittedPages.push(page));
  });

  it('renders nothing when there is a single page', () => {
    configure(1, 1);

    expect(element.querySelector('nav')).toBeNull();
  });

  it('marks the current page', () => {
    configure(2, 3);

    expect(button('Page 2').getAttribute('aria-current')).toBe('page');
    expect(button('Page 1').getAttribute('aria-current')).toBeNull();
  });

  it('emits the clicked page', () => {
    configure(1, 3);

    button('Page 3').click();

    expect(emittedPages).toEqual([3]);
  });

  it('steps to the next and previous page', () => {
    configure(2, 3);

    button('Next page').click();
    button('Previous page').click();

    expect(emittedPages).toEqual([3, 1]);
  });

  it('disables previous on the first page and next on the last page', () => {
    configure(1, 3);
    expect(button('Previous page').disabled).toBeTrue();
    expect(button('Next page').disabled).toBeFalse();

    configure(3, 3);
    expect(button('Next page').disabled).toBeTrue();
  });

  it('does not emit when disabled', () => {
    configure(1, 3, true);

    button('Page 2').click();
    component.goTo(2);

    expect(emittedPages).toEqual([]);
  });

  it('does not emit for the current page or out-of-range pages', () => {
    configure(2, 3);

    component.goTo(2);
    component.goTo(0);
    component.goTo(4);

    expect(emittedPages).toEqual([]);
  });
});
