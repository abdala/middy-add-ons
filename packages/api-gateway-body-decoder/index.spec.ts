import middy from '@middy/core'
import * as t from 'io-ts'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { apiGatewayBodyDecoder, DecodedAPIGatewayProxyEvent } from './index'
import { promisify } from 'util'
import { apiGatewayBodyTransformer } from '@middy-add-ons/api-gateway-body-transformer'

describe('Middy domain event wrapper', () => {
  const proxyEvent: Function = (): Partial<APIGatewayProxyEvent> => ({
    body: '{"foo":"bar"}',
  })
  const context: Function = (): Partial<Context> => ({})
  
  const BodyString = t.string
  type BodyString = t.TypeOf<typeof BodyString>
  
  const Body = t.type({ foo: t.string })
  type Body = t.TypeOf<typeof Body>

  it('should receive an domain event in the handler', async () => {
    const handler = promisify(
      middy(async (event: DecodedAPIGatewayProxyEvent<BodyString>) => {
          return event.decodedBody
      })
      .use(apiGatewayBodyDecoder(BodyString))
    )

    const response = await handler(proxyEvent(), context())

    expect(response).toEqual('{"foo":"bar"}')
  })

  it('should play with API Gateway Body Transformer', async () => {
    const handler = promisify(
      middy(async (event: DecodedAPIGatewayProxyEvent<Body>) => {
          return event.decodedBody
      })
      .use(apiGatewayBodyTransformer())
      .use(apiGatewayBodyDecoder(Body))
    )

    const response = await handler(proxyEvent(), context())

    expect(response).toEqual({
      statusCode: 200,
      body: '{"foo":"bar"}',
    })
  })
})
