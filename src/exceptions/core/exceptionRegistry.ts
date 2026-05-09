import { BadGatewayException } from './badGatewayException';
import { BadRequestException } from './badRequestException';
import { ConflictException } from './conflictException';
import { Exception } from './exception';
import { exceptionFactories, type IExceptionConstructor } from './exceptionFactories';
import { ForbiddenException } from './forbiddenException';
import { GatewayTimeoutException } from './gatewayTimeoutException';
import { InternalServerErrorException } from './internalServerErrorException';
import { InvalidStateException } from './invalidStateException';
import { MethodNotAllowedException } from './methodNotAllowedException';
import { NotFoundException } from './notFoundException';
import { NotImplementedException } from './notImplementedException';
import { ServiceUnavailableException } from './serviceUnavailableException';
import { TooManyRequestsException } from './tooManyRequestsException';
import { UnauthorizedException } from './unauthorizedException';
import { UnprocessableEntityException } from './unprocessableEntityException';

/**
 * Single source of truth for the `name` → constructor mapping used by
 * {@link Exception.deserialize}. Every exception class shipped by the
 * library registers itself here. Adding a new subclass is a one-line
 * addition to this list.
 *
 * Keep this list in sync with the public exports of
 * `exceptions/index.ts`. A subclass that ships in the public API but
 * is missing here will silently round-trip as a generic
 * {@link Exception} — type information lost.
 */
const knownExceptions: readonly IExceptionConstructor[] = [
	Exception,
	InvalidStateException,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
	NotImplementedException,
	MethodNotAllowedException,
	ConflictException,
	UnprocessableEntityException,
	TooManyRequestsException,
	InternalServerErrorException,
	BadGatewayException,
	ServiceUnavailableException,
	GatewayTimeoutException,
];

// Wire the late-binding registry. Once this module has been imported
// (via the package barrel) `Exception.deserialize` can resolve any
// known subclass by name. Indexed by the class `name` field — which
// every Exception subclass sets in its constructor.
exceptionFactories.registry = new Map(knownExceptions.map((ctor) => [ctor.name, ctor]));
