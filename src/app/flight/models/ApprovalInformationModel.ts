import { ApprovalOptionModel } from "./ApprovalOptionModel";
import { ApprovelNodeModel } from "./ApprovelNodeModel";
export class ApprovalInformationModel {
  CanSkipApproval: boolean; // 可以跳过审批（一般为秘书型或特殊型账号才有）
  Options: ApprovalOptionModel[]; // 审批选项
  Nodes: ApprovelNodeModel[]; // 固定审批人节点
}
