export const API_AWS_CONST = {
  MANDATORY_HEADERS_NAME_LIST: ['FID-LOG-TRACKING-ID', 'FID-USER-TYPE', 'FID-CONSUMER-APP-PROCESS', 'FID-PRINCIPAL-ROLE'],
  HEADERS: {
    FID_LOG_TRACKING_ID: 'FID-LOG-TRACKING-ID',
    FID_USER_ID: 'FID-USER-ID',
    FID_USER_TYPE: 'FID-USER-TYPE',
    FID_PRINCIPAL_ROLE: 'FID-PRINCIPAL-ROLE',
    FID_CONSUMER_APP_PROCESS: 'FID-CONSUMER-APP-PROCESS',
  },
  CHAR: {
    COMMA: ',',
    SLASH: '/',
    COLON: ':',
    SEMI_COLON: ';',
    HYPHEN: '-',
    AT: '@',
    UNDERSCORE: '_',
    QUESTION: '?',
    DOT: '.',
  },
  COMMON: {
    APP_NAME: 'cloud-aws',
    DEFAULT_DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm:ss.SSSS',
  },
  CORS: {
    HEADERS: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
      'Access-Control-Max-Age',
      'Access-Control-Allow-Credentials',
    ],
    WHITELIST: ['127.0.0.0', '127.0.0.0:3002', 'localhost:3002', '0.0.0.0:3002', '*', 'localhost', '*'],
    ALLOW_HEADERS: ['Content-type', 'Authorization', 'Origin', 'X-Forwaded-for', 'Referrer', 'Origin'],
    ALLOW_METHODS: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    ALLOW_CRED: true,
  },
  HEALTH_CHECK: {
    URL: 'https://jsonplaceholder.typicode.com/posts/1',
    METHOD: 'GET',
    PROXY: 'http://http.proxy.fmr.com:8000',
  },
  MIMETYPE: {
    APPLICATION_JSON: 'application/json',
    MULTIPART_FORM_DATA: 'multipart/form-data',
  },
  REGEX: {
    MULTIPART_CONTENT_TYPE: /^(multipart)[\/\\\-\w]*$/,
    FILE_NAME: /^[\w]{2,}(.(csv|xls|xlsx|env|mp4))$/,
    NUMBER: /^[\d]$/,
  },
};
