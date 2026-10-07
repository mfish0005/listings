import { HttpErrorResponse } from '@angular/common/http';
import { toSaveFailure } from './save-failure';

describe('toSaveFailure', () => {
  it('reports a deleted listing for a 404', () => {
    expect(toSaveFailure(new HttpErrorResponse({ status: 404 }))).toEqual({ status: 'gone' });
  });

  it('carries the message and per-field errors from a 400', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        title: 'Invalid listing',
        detail: 'Price must be greater than 0. State must be a 2-letter code.',
        errors: { price: ['Price must be greater than 0.'], state: ['State must be a 2-letter code.'] }
      }
    });

    expect(toSaveFailure(error)).toEqual({
      status: 'failed',
      message: 'Price must be greater than 0. State must be a 2-letter code.',
      fieldErrors: { price: ['Price must be greater than 0.'], state: ['State must be a 2-letter code.'] }
    });
  });

  it('has no field errors for other failures', () => {
    const error = new HttpErrorResponse({ status: 500, error: { title: 'Something went wrong' } });

    expect(toSaveFailure(error)).toEqual({ status: 'failed', message: 'Something went wrong', fieldErrors: {} });
  });

  it('explains when the API cannot be reached', () => {
    const failure = toSaveFailure(new HttpErrorResponse({ status: 0 }));

    expect(failure.status).toBe('failed');
    expect(failure.status === 'failed' && failure.message).toContain('Could not reach the listing service');
  });

  it('uses a generic message when the error is not an HTTP error', () => {
    expect(toSaveFailure(new Error('boom'))).toEqual({
      status: 'failed',
      message: 'Something went wrong while saving this listing. Please try again.',
      fieldErrors: {}
    });
  });
});
