import { HttpErrorResponse } from '@angular/common/http';
import { toProblemMessage } from './problem-message';

describe('toProblemMessage', () => {
  const fallback = 'Fallback message.';

  it('prefers the problem details detail', () => {
    const error = new HttpErrorResponse({ status: 400, error: { title: 'Bad', detail: 'Price is too low.' } });

    expect(toProblemMessage(error, fallback)).toBe('Price is too low.');
  });

  it('falls back to the title when there is no detail', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } });

    expect(toProblemMessage(error, fallback)).toBe('Something went wrong');
  });

  it('explains when the API cannot be reached', () => {
    expect(toProblemMessage(new HttpErrorResponse({ status: 0 }), fallback)).toContain('Could not reach the listing service');
  });

  it('uses the fallback for a response without a problem body', () => {
    expect(toProblemMessage(new HttpErrorResponse({ status: 502, error: null }), fallback)).toBe(fallback);
  });

  it('uses the fallback for anything that is not an HTTP error', () => {
    expect(toProblemMessage(new Error('boom'), fallback)).toBe(fallback);
  });
});
