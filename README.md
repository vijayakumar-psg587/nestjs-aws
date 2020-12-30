<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>


## Description
<h1>Nestjs app with Fastify server utilizing various AWS services </h1>
<h3>Currently only S3 functionalities have been implemented</h3>


## Installation

```bash
$ npm install
```

## Running the app

First make sure to create /find a way to inject app configuration. Currently done via config/ in local


├── config

│   ├── development

│   │   ├── .env

```bash
# development
$ npm run start:nodemon:dev

# build
$ npm run build:webpack:dev

# build & deploy -dev
$ npm run pm2:start:dev

# build & deploy - prod
$ npm run pm2:start:prod // make sure that webpack.prod.config.js is available for that
```


## Stay in touch

- Author - [Vijayakumar](www.linkedin.com/in/vijay-kumar-shanmugam)
- Twitter - [Vijay@handofgod_10](https://twitter.com/handofgod_10)

## License

  Nest is [MIT licensed](LICENSE).
