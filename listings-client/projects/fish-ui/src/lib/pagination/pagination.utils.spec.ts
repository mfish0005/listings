import { buildPageItems } from './pagination.utils';

describe('buildPageItems', () => {
  it('lists every page when they all fit', () => {
    expect(buildPageItems(1, 1, 1)).toEqual([1]);
    expect(buildPageItems(3, 7, 1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the end when near the start', () => {
    expect(buildPageItems(1, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
    expect(buildPageItems(3, 20, 1)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20]);
  });

  it('collapses the start when near the end', () => {
    expect(buildPageItems(20, 20, 1)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
    expect(buildPageItems(18, 20, 1)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20]);
  });

  it('collapses both sides in the middle', () => {
    expect(buildPageItems(10, 20, 1)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('widens the window with a larger sibling count', () => {
    expect(buildPageItems(10, 30, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 30]);
  });
});
