# API Gateway body transform

Middy Middleware to parse APIGatewayProxyEvent body and generate standard APIGatewayProxyResult output using the power of typescript.

## Install

```sh
npm install @middy-add-ons/api-gateway-body-transform
```

### Usage

```js
import middy from '@middy/core'
import { apiGatewayBodyTransform } from '@middy-add-ons/api-gateway-body-transformer'

middy(...)
    .use(apiGatewayBodyTransform());