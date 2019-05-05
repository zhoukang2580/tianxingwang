import { TmcApprovalTypeEnum } from "./../TmcApprovalTypeEnum";
export class TmcFlightModel {
  OrderPayType: string; //  下单支付选项
  IsAllowPersonPay: boolean; //  是否允许个付
  IsAllowCompanyPay: boolean; //  是否允许公付
  IsAllowBalancePay: boolean; //  是否允许余额个付
  IsAllowCreditPay: boolean; //  是否允许信用付
  OrderType: string; //  出差类型
  IsAllowPersonTravel: boolean; //  是否允许因私
  IsAllowBusinessTravel: boolean; //  是否允许因公
  ApprovalType: TmcApprovalTypeEnum; // 审批类型
  OnlineFee: string; //  线上服务费
  OfflineFee: string; //  线下服务费
  HoldMinute: number; //  机票保留时间
  ApiIssueFee: string; //
  ApiExchangeFee: string; //
  ApiRefundFee: string; //
  RewardRatio: number; //  航段奖励返还
  FeeType: number; //  服务费类型
  FeeTypeName: string; //  服务费类型名称
}
