export class BaseRequest {
  Ticket?: string;
  Domain?: string;
  ImageCode?: string;
  ImageValue?: string;
  Method: string;
  Timestamp?: number;
  TraceId?: string;
  Version?: string;
  Language?: string;
  Url?: string;
  Data: any;
  FileValue?: string;
  IsShowLoading?:boolean
}
