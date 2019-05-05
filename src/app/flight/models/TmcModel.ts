import { TmcHotelModel } from "./hotel/TmcHotelModel";
import { TmcTrainModel } from "./train/TmcTrainModel";
import { TmcFlightModel } from "./flight/TmcFlightModel";
import { TmcGroupModel } from "./TmcGroupModel";
import { TmcApprovalTypeEnum } from "./TmcApprovalTypeEnum";

export class TmcModel {
  Id: number; //  Id
  Code: string; //  客户代码
  Name: string; //  客户名称
  OutNumberNameList: string[]; // List<:string;// > 外部编号列表
  OutNumberRequiryNameList: string[]; // List<:string;// > 外部编号必填列表
  FlightOption: TmcFlightModel; // 机票节点
  TrainOption: TmcTrainModel; // 火车票节点
  HotelOption: TmcHotelModel; // 酒店节点
  IsAllowPersonPay: boolean; //  是否允许个付
  IsAllowCompanyPay: boolean; //  是否允许公付
  IsAllowBalancePay: boolean; //  是否允许余额个付
  IsAllowPersonTravel: boolean; //  是否允许因私
  IsAllowBusinessTravel: boolean; //  是否允许因公
  ApprovalType: TmcApprovalTypeEnum; // 审批类型
  IsAllowReason: boolean; //  是否可以自定义违规理由
  IsNeedIllegalReason: boolean; //  违规是否需要理由
  IsShowServiceFee: boolean; //  是否显示服务费
  FlightOnlineFee: string; //  线上服务费
  FlightOfflineFee: string; //  线下服务费
  FlightHoldMinute: number; //  机票保留时间
  FlightApiIssueFee: string; //
  FlightApiExchangeFee: string; //
  FlightApiRefundFee: string; //
  FlightRewardRatio: number; //  航段奖励返还
  FlightFeeType: number; //  机票服务费类型
  RegionType: string; //  服务内容,逗号隔开 RegionType RegionTypeName :string;//  服务内容名称,逗号隔开
  GourpCompany: TmcGroupModel; // 所属集团
}
