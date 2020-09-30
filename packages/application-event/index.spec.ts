import * as t from 'io-ts'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { middyApplicationEvent } from './index'
import { promisify } from 'util'

describe('Middy domain event wrapper', () => {
  const proxyEvent: Function = (): Partial<APIGatewayProxyEvent> => ({
    body: 'bar',
  })
  const context: Function = (): Partial<Context> => ({ functionName: 'applicationEventHandler' })
  const DomainEvent = t.readonly(
    t.type({
      foo: t.string,
      functionName: t.string,
    }),
  )
  type DomainEvent = t.TypeOf<typeof DomainEvent>

  it('should receive an domain event in the handler', async () => {
    const handler = promisify(
      middyApplicationEvent(
        DomainEvent,
        (event: APIGatewayProxyEvent, context: Context) => ({
          foo: event.body || '',
          functionName: context.functionName,
        }),
        async (domainEvent: DomainEvent) => {
          return { ...domainEvent }
        },
      ),
    )

    const response = await handler(proxyEvent(), context())

    expect(response).toEqual({ foo: 'bar', functionName: 'applicationEventHandler' })
  })
})
