export interface IResponse<T> {
  Status: boolean;
  Code: string;
  Message: string;
  Timestamp: string;
  TraceId: string;
  Sign: string;
  Data: T;
}
