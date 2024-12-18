import { XYError, XYErrorCode } from './XYError';

export function isXYError<T extends XYErrorCode>(error: Error, code: T): error is XYError<T> {
  return 'code' in error && error.code === code;
}
