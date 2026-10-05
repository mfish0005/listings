export type PageItem = number | 'ellipsis';

export function buildPageItems(currentPage: number, totalPages: number, siblingCount: number): PageItem[] {
  const slotsWithoutEdges = siblingCount * 2 + 3;
  const maxWithoutEllipsis = slotsWithoutEdges + 2;

  if (totalPages <= maxWithoutEllipsis) {
    return range(1, totalPages);
  }

  const windowStart = Math.max(currentPage - siblingCount, 2);
  const windowEnd = Math.min(currentPage + siblingCount, totalPages - 1);
  const showStartEllipsis = windowStart > 3;
  const showEndEllipsis = windowEnd < totalPages - 2;

  if (!showStartEllipsis) {
    return [...range(1, slotsWithoutEdges), 'ellipsis', totalPages];
  }

  if (!showEndEllipsis) {
    return [1, 'ellipsis', ...range(totalPages - slotsWithoutEdges + 1, totalPages)];
  }

  return [1, 'ellipsis', ...range(windowStart, windowEnd), 'ellipsis', totalPages];
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
