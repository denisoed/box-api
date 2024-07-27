import { HttpException, HttpStatus } from '@nestjs/common';

export function unathorizedError(message: string) {
  throw new HttpException(
    {
      status: HttpStatus.UNAUTHORIZED,
      error: message,
    },
    HttpStatus.UNAUTHORIZED,
  );
}

export function notFoundError(message: string) {
  throw new HttpException(
    {
      status: HttpStatus.NOT_FOUND,
      error: message,
    },
    HttpStatus.NOT_FOUND,
  );
}
