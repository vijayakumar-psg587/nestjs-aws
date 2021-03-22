import { Expose } from 'class-transformer';

export class CommonOutputResponse {
  @Expose()
  message: string;
  @Expose()
  timestamp?: string;
  @Expose()
  status: string;
  @Expose()
  data?: object;
}
