import { FlightBookSegmentModel } from "./flight/FlightBookSegmentModel";
import { FlightBookCabinModel } from "./flight/FlightBookCabinModel";
import { CredentialsModel } from "./CredentialsModel";
export class PassengerModel {
  Credentials: CredentialsModel; // Yes 乘客证件
  FlightCabin: FlightBookCabinModel; // Yes 预订舱位(机票预订有效)
  FlightSegment: FlightBookSegmentModel; // Yes 预订航段(机票预订有效) Train TrainEntity Yes 预订火车信息(火车预订有效)
  CostCenterCode: string; //  Yes 成本中心代码
  CostCenterName: string; //  Yes 成本中心名称
  OrganizationName: string; //  No 组织名称
  OrganizationCode: string; //  No 组织代码
  IllegalPolicy: string; //  No 违反差旅政策内容
  IllegalReason: string; //  No 违反差旅政策原因
  TravelType: number; //  Yes
  TravelPayType: number; //  Yes
  Mobile: string; //
  Email: string; //
  OutNumbers: { [key: string]: string }; // Dictionary<string,string>  外部编号
  ApprovalId: number; // long  审批人
  IsSkipApprove: boolean; // Bool  跳过审批
}
