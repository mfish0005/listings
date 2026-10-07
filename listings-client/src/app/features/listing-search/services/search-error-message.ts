import { toProblemMessage } from '../../../shared/http/problem-message';

const unexpectedMessage = 'Something went wrong while searching. Please try again.';

export function toSearchErrorMessage(error: unknown): string {
  return toProblemMessage(error, unexpectedMessage);
}
