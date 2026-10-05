import { HttpErrorResponse } from '@angular/common/http';
import { toSearchErrorMessage } from './search-error-message';

describe('toSearchErrorMessage', () => {
  it('shows the problem details detail from a 400', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { title: 'Invalid search request', detail: 'minPrice cannot be greater than maxPrice.' }
    });

    expect(toSearchErrorMessage(error)).toBe('minPrice cannot be greater than maxPrice.');
  });

  it('falls back to the title when there is no detail', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'An unexpected error occurred.' } });

    expect(toSearchErrorMessage(error)).toBe('An unexpected error occurred.');
  });

  it('explains when the API cannot be reached', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(toSearchErrorMessage(error)).toContain('Could not reach');
  });

  it('uses a generic message for a response without a body', () => {
    const error = new HttpErrorResponse({ status: 502, error: null });

    expect(toSearchErrorMessage(error)).toContain('Something went wrong');
  });

  it('uses a generic message for non-HTTP errors', () => {
    expect(toSearchErrorMessage(new Error('boom'))).toContain('Something went wrong');
  });
});
