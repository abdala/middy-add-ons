# API Gateway Body Decoder

Middleware to decode (unserialize) application event from AWS events using io-ts.

## Install

```sh
npm install @middy-add-ons/api-gateway-body-decoder
```

### Usage

```js
import middy from '@middy/core'
import { apiGatewayBodyDecoder } from '@middy-add-ons/api-gateway-body-decoder'

const Body = t.readonly(
    t.type({
        foo: t.string,
        functionName: t.string,
    }),
)
type Body = t.TypeOf<typeof Body>

middy(...)
    .use(apiGatewayBodyDecoder(Body));
```