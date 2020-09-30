import middy from '@middy/core'
import { Context } from 'aws-lambda';
import { fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { Decoder, Errors } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';

export class ApplicationEventDecodeError extends Error {}

export function middyApplicationEvent<E, T, R, I>(
  decoder: Decoder<I, T>,
  eventTransformer: (awsEvent: E, context: Context) => I,
  service: (applicationEvent: T) => Promise<R>,
): middy.Middy<E, R> {
  return middy(
    async (awsEvent: E, context: Context): Promise<R> => {
      const applicationEvent: I = eventTransformer(awsEvent, context)

      return service(
        pipe(
          decoder.decode(applicationEvent),
          fold(
              (errors: Errors) => {
                  throw new ApplicationEventDecodeError(failure(errors).join('\n'));
              },
              (value: T): T => value,
          ),
        )
      )
    },
  )
}
