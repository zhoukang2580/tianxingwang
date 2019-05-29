export class ValidatorEntity {
  Name: string;
  Ticket: string; // 获取是否有效
  Id?: string;
  IsShareTicket?: boolean; // false,
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

