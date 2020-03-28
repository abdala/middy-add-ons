import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import { HttpError, InternalServerError } from 'http-errors'

export const apiGatewayBodyTransform: middy.Middleware<object> = () => ({
  before: httpJsonBodyParser().before,

  after: (handler: middy.HandlerLambda, next: middy.NextFunction): void => {
    if (handler.response) {
      handler.response = {
        statusCode: 200,
        body: JSON.stringify(handler.response),
      }

      return next()
    }

    handler.response = {
      statusCode: 204,
      body: '',
    }

    return next()
  },

  onError: async (handler: middy.HandlerLambda): Promise<Error> => {
    if (!(handler.error instanceof HttpError)) {
      return new InternalServerError()
    }

    return handler.error
  },
})
