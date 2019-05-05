import { ChangeDetailModel } from "./ChangeDetailModel";
import { RefundDetailModel } from "./RefundDetailModel";
import { EndorsementDetailModel } from "./EndorsementDetailModel";

export class RefundChangeModel {
  Airline: string; //  航空公司
  Cabin: string; //  舱位代码
  Remark: string; //  备注
  BaggageAllowance: string; //  行李限重
  RefundDetail: RefundDetailModel; //  退票规则明细
  ChangeDetail: ChangeDetailModel; //  改签规则明细
  EndorsementDetail: EndorsementDetailModel; //  签转规则明细
}
