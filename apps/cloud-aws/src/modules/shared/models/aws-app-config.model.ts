export class AwsAppConfigModel {
  host: string;
  port: string | number;
  timeout: number;
  retries: number;
  maxRedirects: number;
  contextPath: string;
  appVersion: string;
  maxSockets?: number;
}
