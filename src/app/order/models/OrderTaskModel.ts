import { OrderTaskApproverModel } from './OrderTaskApproverModel';

export class OrderTaskModel {
    Name: string;
    Tag: string;
    Type: string;
    OverTime: string;
    Approvers: OrderTaskApproverModel[];
  }
  