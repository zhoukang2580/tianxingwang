export class BaseApiResultModel<T> {
  Status: boolean;
  Code: string;
  Message: string;
  Timestamp: number;
  TraceId: string;// uuid+timestamp
  Data: T;
}
