import * as t from 'io-ts'
import { APIGatewayProxyEvent, Context } from 'aws-lambda'
import { middyDomainEvent } from './index'
import { promisify } from 'util'

describe('Middy domain event wrapper', () => {
  const proxyEvent: Function = (): Partial<APIGatewayProxyEvent> => ({
    body: 'bar',
  })
  const context: Function = (): Partial<Context> => ({})
  const DomainEvent = t.readonly(
    t.type({
      foo: t.string,
    }),
  )
  type DomainEvent = t.TypeOf<typeof DomainEvent>

  it('should receive an domain event in the handler', async () => {
    const handler = promisify(
      middyDomainEvent(
        DomainEvent,
        (event: APIGatewayProxyEvent): DomainEvent => ({
          foo: event.body || '',
        }),
        async (domainEvent: DomainEvent) => {
          return { foo: domainEvent.foo }
        },
      ),
    )

    const response = await handler(proxyEvent(), context())

    expect(response).toEqual({ foo: 'bar' })
  })
})
