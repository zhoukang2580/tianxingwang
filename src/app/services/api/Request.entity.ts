import { AppHelper } from "src/app/appHelper";
export class RequestEntity {
  TicketName?: string;
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
  IsShowMessage?: boolean;
  LoadingMsg?: string;
  IsRedirctLogin?: boolean;
  IsRedirctNoAuthorize?: boolean;
  IsForward?: boolean;
  Timeout?: number;
  constructor() {
    this.Timestamp = Math.floor(Date.now() / 1000);
    this.Language = AppHelper.getLanguage();
    this.Ticket = AppHelper.getTicket();
    this.TicketName = AppHelper.getTicketName();
    this.Domain = AppHelper.getDomain();
    if (this.TicketName != "ticket") {
      this[this.TicketName] = this.Ticket;
      this.Ticket = "";
    } else {
      this.TicketName = "";
    }
  }
}
