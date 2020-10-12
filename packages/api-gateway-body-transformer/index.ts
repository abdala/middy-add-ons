import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import createError from 'http-errors'

export type APIGatewayBodyTransformerOptions = {
  customResponse?: (handlerResponse: any) => APIGatewayProxyResult
  reviver?: (key: string, value: any) => any
}

export interface ParsedAPIGatewayProxyEvent extends APIGatewayProxyEvent {
  parsedBody?: any
}

export const apiGatewayBodyTransformer = (config?: APIGatewayBodyTransformerOptions) => ({
  before: async (handler: middy.HandlerLambda<ParsedAPIGatewayProxyEvent>): Promise<void> => {
    try {
      const data = handler.event.isBase64Encoded
        ? Buffer.from(handler.event.body || '', 'base64').toString()
        : handler.event.body

      handler.event.parsedBody = JSON.parse(data || '{}', config?.reviver)
    } catch (_) {
      throw new createError.UnprocessableEntity('Content type defined as JSON but an invalid JSON was provided')
    }
  },

  after: async (handler: middy.HandlerLambda): Promise<void> => {
    if (config?.customResponse) {
      handler.response = config.customResponse(handler.response);
      return;
    }

    if (handler.response) {
      handler.response = {
        statusCode: 200,
        body: JSON.stringify(handler.response),
      }
      return;
    }

    handler.response = {
      statusCode: 204,
      body: '',
    }
  },

  onError: async (handler: middy.HandlerLambda): Promise<Error> => {
    if (createError.isHttpError(handler.error)) {
      return handler.error
    }

    return new createError.InternalServerError()    
  },
})
