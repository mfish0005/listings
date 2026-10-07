import { HttpErrorResponse } from '@angular/common/http';
import { toServerFailure } from './server-failure';

describe('toServerFailure', () => {
  const fallback = 'Fallback message.';

  it('carries the message and per-field errors from a 400', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Invalid listing',
        detail: 'Price must be greater than 0.',
        errors: { price: ['Price must be greater than 0.'] }
      }
    });

    expect(toServerFailure(error, fallback)).toEqual({
      message: 'Price must be greater than 0.',
      fieldErrors: { price: ['Price must be greater than 0.'] }
    });
  });

  it('has no field errors when the response has none', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } });

    expect(toServerFailure(error, fallback)).toEqual({ message: 'Something went wrong', fieldErrors: {} });
  });

  it('uses the fallback for anything that is not an HTTP error', () => {
    expect(toServerFailure(new Error('boom'), fallback)).toEqual({ message: fallback, fieldErrors: {} });
  });
});
