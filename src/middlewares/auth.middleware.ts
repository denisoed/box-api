import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import {
  validateInitDataUnsafe,
  validateWebTgAuthData,
} from '../helpers/telegram';

function verifyWebTgAuthData(data, mode = 'tg') {
  if (
    new Date().valueOf() - new Date(data.auth_date * 1000).valueOf() >
    86400000
  ) {
    // milisecond
    return false;
  }
  if (mode === 'tg') return validateInitDataUnsafe(data);
  if (mode === 'web') return validateWebTgAuthData(data);
  return false;
}

function displayError(message: string) {
  throw new HttpException(
    {
      status: HttpStatus.UNAUTHORIZED,
      error: message,
    },
    HttpStatus.UNAUTHORIZED,
  );
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const initData = req.headers['init-data'];
    const parsedData = JSON.parse((initData as string) || '{}');
    if (!verifyWebTgAuthData(parsedData)) {
      displayError('Init data invalid');
    }
    next();
  }
}
