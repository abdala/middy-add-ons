import middy from '@middy/core'
import { Errors, Type } from 'io-ts'
import { Either, isLeft } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

export class DomainEventDecodeError extends Error {}

export function middyDomainEvent<E, T, R>(
  codec: Type<T>,
  eventTransformer: (awsEvent: E) => T,
  service: (domainEvent: T) => Promise<R>,
): middy.Middy<E, R> {
  return middy(
    async (awsEvent: E): Promise<R> => {
      const domainEvent: T = eventTransformer(awsEvent)
      const result: Either<Errors, T> = codec.decode(domainEvent)

      if (isLeft(result)) {
        throw new DomainEventDecodeError(PathReporter.report(result).join(' - '))
      }

      return service(domainEvent)
    },
  )
}
