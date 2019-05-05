export class ApprovalOptionModel {
  Tag: "Flight" | "Train" | "Hotel" | string; // 产品标签 Flight Train Hotel
  IsNeedApproval: boolean; // 是否需要审批
  CanChooseApprover: boolean; // 可以选择审批人（自由审批或者固定审批但没有指定审 批人）
}
