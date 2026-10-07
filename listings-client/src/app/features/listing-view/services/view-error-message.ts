import { toProblemMessage } from '../../../shared/http/problem-message';

const unexpectedMessage = 'Something went wrong while loading this listing. Please try again.';

export function toViewErrorMessage(error: unknown): string {
  return toProblemMessage(error, unexpectedMessage);
}
