import { LogEntity } from "./log.entity";

export class ExceptionEntity extends LogEntity {
  Method: string;
  Error:any
}
