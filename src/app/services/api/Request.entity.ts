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
  AloneTag?: string;
  FileValue?: string;
  IsShowLoading?: boolean;
  IsShowMessage?: boolean;
  LoadingMsg?: string;
  IsRedirctLogin?: boolean;
  IsRedirctNoAuthorize?: boolean;
  IsForward?: boolean;
  Timeout?: number;
  constructor() {
    this.Timestamp = AppHelper.getTimestamp();
    this.Language = AppHelper.getLanguage();
    this.Ticket = AppHelper.getTicket();
    this.TicketName = AppHelper.getTicketName();
    this.Domain = AppHelper.getDomain();
    const paramters = AppHelper.getQueryParamers();
    const tags = [
      "wechatcode",
      "wechatminicode",
      "dingtalkcode",
      "language",
      "ticket",
      "ticketname",
      "wechatopenid",
      "dingtalkopenid",
      "style",
      "path",
      AppHelper.getTicketName(),
    ];
    for (const p in paramters) {
      if (tags.find((it) => it == p.toLowerCase())) {
        continue;
      }
      this[p] = paramters[p]||"";
    }
    if (this.TicketName != "ticket") {
      this[this.TicketName] = this.Ticket;
      this.Ticket = "";
    } else {
      this.TicketName = "";
    }
  }
}
