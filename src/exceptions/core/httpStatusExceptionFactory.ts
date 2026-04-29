import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { ForbiddenException } from './forbiddenException';
import { InternalServerErrorException } from './internalServerErrorException';
import { NotFoundException } from './notFoundException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { UnauthorizedException } from './unauthorizedException';

export class HttpStatusExceptionFactory {
	static createFromStatus(status: number, message?: string): Exception {
		switch (status) {
			case 400:
				return new BadRequestException(message);
			case 401:
				return new UnauthorizedException(message);
			case 403:
				return new ForbiddenException(message);
			case 404:
				return new NotFoundException(message);
			case 409:
				return new ConflictException(message);
			case 500:
				return new InternalServerErrorException(message);
			case 503:
				return new ServiceUnavailableException(message);
			default:
				return new Exception(message || `HTTP ${status} Error`);
		}
	}
}
