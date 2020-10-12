import middy from '@middy/core'
import { apiGatewayBodyTransformer, ParsedAPIGatewayProxyEvent } from './index'
import { promisify } from 'util'
import createError from 'http-errors'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

describe('Middleware API Gateway Body Transformer', () => {
  const proxyEvent: Function = (): Partial<APIGatewayProxyEvent> => ({
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foo: 'bar' }),
  })
  const context: Partial<Context> = {}

  it('should parse requested body', async () => {
    const handler: Function = promisify(
      middy(async (event: ParsedAPIGatewayProxyEvent) => {
        expect(event.parsedBody).toEqual({ foo: 'bar' })
        return event.parsedBody
      }).use(apiGatewayBodyTransformer()),
    )

    await handler(proxyEvent(), context)
  })

  it('should set status code to 200 when returns content', async () => {
    const handler: Function = promisify(
      middy(async (event: ParsedAPIGatewayProxyEvent) => {
        return event.parsedBody
      }).use(apiGatewayBodyTransformer()),
    )

    const response: APIGatewayProxyResult = await handler(proxyEvent(), context)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(JSON.stringify({ foo: 'bar' }))
  })

  it('should set status code to 204 when there is no content', async () => {
    const handler: Function = promisify(middy(async (_: ParsedAPIGatewayProxyEvent) => {}).use(apiGatewayBodyTransformer()))
    const response: APIGatewayProxyResult = await handler(proxyEvent(), context)

    expect(response.statusCode).toEqual(204)
    expect(response.body).toEqual('')
  })

  it('should return InternalServerError on error', async () => {
    const handler: Function = promisify(
      middy(async (event: ParsedAPIGatewayProxyEvent) => {
        throw Error('Error')
        return event
      }).use(apiGatewayBodyTransformer()),
    )

    await expect(handler(proxyEvent(), context)).rejects.toEqual(new createError.InternalServerError())
  })

  it('should return custom response when config is defined', async () => {
    const handler: Function = promisify(middy(async (_: ParsedAPIGatewayProxyEvent) => {})
      .use(apiGatewayBodyTransformer({
        customResponse: (response: any) => {
          return {
            statusCode: 301,
            body: response
          }
        }
      })))
    const response: APIGatewayProxyResult = await handler(proxyEvent(), context)

    expect(response.statusCode).toEqual(301)
    expect(response.body).toEqual(undefined)
  })
})
