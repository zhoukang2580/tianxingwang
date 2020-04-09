export class RequestEntity {
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
  Token?: string;
  FileValue?: string;
  IsShowLoading?: boolean;
  IsForbidShowMessage?: boolean;
  LoadingMsg?: string;
  IsRedirctLogin?: boolean;
  IsForward?: boolean;
  Timeout?: number;
}
