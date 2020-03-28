import middy from '@middy/core'
import { apiGatewayBodyTransform } from './index'
import { promisify } from 'util'
import { InternalServerError } from 'http-errors'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

describe('Middleware API Gateway Body Transform', () => {
  const proxyEvent: Function = (): Partial<APIGatewayProxyEvent> => ({
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foo: 'bar' }),
  })
  const context: Partial<Context> = {}

  it('should parse requested body', async () => {
    const handler: Function = promisify(
      middy(async (event: APIGatewayProxyEvent) => {
        expect(event.body).toEqual({ foo: 'bar' })
        return event.body
      }).use(apiGatewayBodyTransform()),
    )

    await handler(proxyEvent(), context)
  })

  it('should set status code to 200 when returns content', async () => {
    const handler: Function = promisify(
      middy(async (event: APIGatewayProxyEvent) => {
        return event.body
      }).use(apiGatewayBodyTransform()),
    )

    const response: APIGatewayProxyResult = await handler(proxyEvent(), context)

    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(JSON.stringify({ foo: 'bar' }))
  })

  it('should set status code to 204 when there is no content', async () => {
    const handler: Function = promisify(middy(async () => {}).use(apiGatewayBodyTransform()))
    const response: APIGatewayProxyResult = await handler(proxyEvent(), context)

    expect(response.statusCode).toEqual(204)
    expect(response.body).toEqual('')
  })

  it('should return InternalServerError on error', async () => {
    const handler: Function = promisify(
      middy(async (event: APIGatewayProxyEvent) => {
        throw Error('Error')
        return event
      }).use(apiGatewayBodyTransform()),
    )

    await expect(handler(proxyEvent(), context)).rejects.toEqual(new InternalServerError())
  })
})
