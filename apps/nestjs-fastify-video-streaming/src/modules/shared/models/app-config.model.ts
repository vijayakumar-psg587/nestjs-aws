export class AppConfigModel {
    port: number;
    host: string;
    version: string;
    name: string;
    context_path: string;
    isEnableProxy: boolean;
    node_env: string;
    body_limit ?: number;
    service_retry_count: number;
}