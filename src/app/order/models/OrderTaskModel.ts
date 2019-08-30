import { OrderTaskApproverModel } from "./OrderTaskApproverModel";

export class OrderTaskModel {
  InsertTime: string;
  Name: string;
  Tag: string;
  Type: string;
  OverTime: string;
  Approvers: OrderTaskApproverModel[];
}
