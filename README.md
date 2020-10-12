# Middy add-ons

Group of packages to use together with middy

## API Gateway Body Transformer

Middy middleware to transform body content for request and response

### Usage

```js
import middy from '@middy/core'
import { apiGatewayBodyTransform } from '@middy-add-ons/api-gateway-body-transformer'

middy(...)
    .use(apiGatewayBodyTransform());
```

## API Gateway Body Decoder

Middleware to decode (unserialize) application event from AWS events using io-ts.

### Usage

```js
import middy from '@middy/core'
import { middyApplicationEvent } from '@middy-add-ons/api-gateway-body-decoder'

const Body = t.readonly(
    t.type({
        foo: t.string,
        functionName: t.string,
    }),
)
type Body = t.TypeOf<typeof Body>

import { apiGatewayBodyDecoder } from '@middy-add-ons/api-gateway-body-decoder'

middy(...)
    .use(apiGatewayBodyDecoder(Body));
```

