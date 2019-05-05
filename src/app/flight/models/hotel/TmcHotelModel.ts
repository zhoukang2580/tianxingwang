import { TmcApprovalTypeEnum } from "./../TmcApprovalTypeEnum";
export class TmcHotelModel {
  OrderPayType: string; //  下单支付选项
  IsAllowPersonPay: boolean; //  是否允许个付
  IsAllowCompanyPay: boolean; //  是否允许公付
  IsAllowBalancePay: boolean; //  是否允许余额个付
  IsAllowCreditPay: boolean; //  是否允许信用付
  OrderType: string; //  出差类型
  IsAllowPersonTravel: boolean; //  是否允许因私
  IsAllowBusinessTravel: boolean; //  是否允许因公
  ApprovalType: TmcApprovalTypeEnum; // 审批类型
}
