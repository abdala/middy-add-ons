# Middy add-ons

Group of packages to use together with middy

## API Gateway Body transform

Middy middleware to transform body content for request and response

### Usage

```js
import { apiGatewayBodyTransform } from './index'

middy(...)
    .use(apiGatewayBodyTransform());
```

## Middy Application Event

Wrapper around middy function to decode (unserialize) application event from AWS events using io-ts.

### Usage

```js
import { middyApplicationEvent } from '@middy-add-ons/application'

const DomainEvent = t.readonly(
    t.type({
        foo: t.string,
        functionName: t.string,
    }),
)
type DomainEvent = t.TypeOf<typeof DomainEvent>

export const handler = middyApplicationEvent(
    DomainEvent,
    (event: APIGatewayProxyEvent, context: Context) => ({
        foo: event.body || '',
        functionName: context.functionName,
    }),
    async (domainEvent: DomainEvent) => {
        return { ...domainEvent }
    },
);
```

