**Example of MonoRepo in Nestjs**

You will find two different applications

_Note:_ For both the apps - config folder is necessary - Please create the environment variables that are required for you -

Follow the steps after going into the app that you wanted to create configuration for

Ex of configuration

```bash
- mkdir config
 - cd config && mkdir development && cd development
 - vi .env
```

:::no-loc text="APP_HOST=0.0.0.0
APP_PORT=3002
APP_ENV_DEV=dev
APP_CONTEXT_PATH=/file-stream
APP_VERSION=/v1
NODE_ENV=dev
ENABLE_HTTPS_PROXY=false
PROXY_HOST=http.proxy.fmr.com
PROXY_PORT=8000
APP_SERVICE_RETRY_COUNT=2

APP_SWAGGER_TITLE=AWS API
APP_SWAGGER_DESC=Api to stream videos from aws
APP_SWAGGER_EMAIL=testemail
APP_SWAGGER_CONTACT_NAME=testContactName
APP_SWAGGER_SERVER_URL=https://localhost:3002
APP_SWAGGER_ENDPOINT=swagger-ui":::

- Nestjs-fastify-video-streaming (which is actually stores medium media files in local)

- Cloud-awws (fastify based storage in aws S3)

The configurations are available in nestjs-cli.json where specific webpack modules are used for each
