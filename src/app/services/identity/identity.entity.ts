export class IdentityEntity {
  Name: string;
  Ticket: string; // 获取是否有效
  Id?: string;
  IsShareTicket?: boolean; // false,
  Token?:string;
  WebTicket?:string;
  Numbers: {
    [key: string]: string;
  };
  public getNumber(name:string)
  {
    if(!this.Numbers)
      return null;
     return this.Numbers[name];
  }
}

