import { ApproverModel } from "./ApproverModel";
export class OrderTaskModel {
  Name: string; //  审批名称
  Tag: string; //  标签
  OverTime: string; //  过期时间
  Type: string; //  审批类型
  Approvers: Array<ApproverModel>; // 审批人
}
