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
    DEFAULT_DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss.SSSS',
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
};
