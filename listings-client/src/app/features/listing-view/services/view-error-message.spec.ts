import { HttpErrorResponse } from '@angular/common/http';
import { toViewErrorMessage } from './view-error-message';

describe('toViewErrorMessage', () => {
  it('shows the problem details detail', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong', detail: 'The database is down.' } });

    expect(toViewErrorMessage(error)).toBe('The database is down.');
  });

  it('falls back to the title when there is no detail', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } });

    expect(toViewErrorMessage(error)).toBe('Something went wrong');
  });

  it('explains when the API cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toViewErrorMessage(error)).toContain('Could not reach the listing service');
  });

  it('uses a generic message for anything else', () => {
    expect(toViewErrorMessage(new Error('boom'))).toBe('Something went wrong while loading this listing. Please try again.');
    expect(toViewErrorMessage(new HttpErrorResponse({ status: 502, error: null }))).toContain('while loading this listing');
  });
});
