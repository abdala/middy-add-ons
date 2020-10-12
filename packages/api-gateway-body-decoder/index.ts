import middy from '@middy/core'
import { fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { Decoder, Errors } from 'io-ts';
import { failure } from 'io-ts/lib/PathReporter';
import { ParsedAPIGatewayProxyEvent } from '@middy-add-ons/api-gateway-body-transformer';

export class APIGatewayBodyDecoderError extends Error {}

export interface DecodedAPIGatewayProxyEvent<T> extends ParsedAPIGatewayProxyEvent {
  decodedBody: T
}

export function parseType<I, T>(decoder: Decoder<I, T>, data: I): T {
  return pipe(
    decoder.decode(data),
    fold(
      (errors: Errors) => {
        throw new APIGatewayBodyDecoderError(failure(errors).join('\n'));
      },
      (value: T): T => value,
    ),
  )
}

export function apiGatewayBodyDecoder<I, T>(decoder: Decoder<I, T>) {
  return {
    before: async (handler: middy.HandlerLambda<DecodedAPIGatewayProxyEvent<T>>): Promise<void> => {
      handler.event.decodedBody = parseType(decoder, handler.event.parsedBody || handler.event.body)
    }
  }
}