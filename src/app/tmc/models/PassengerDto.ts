import {
  OrderTravelPayType,
  OrderTravelType,
} from "../../order/models/OrderTravelEntity";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { FlightCabinEntity } from "src/app/flight/models/flight/FlightCabinEntity";
import { StaffEntity, PolicyEntity } from "src/app/hr/staff.service";
import { CredentialsEntity } from "./CredentialsEntity";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { TrainEntity } from "src/app/train/models/TrainEntity";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { OrderHotelType } from "src/app/order/models/OrderHotelEntity";
import { FlightFareEntity } from "src/app/flight/models/FlightFareEntity";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { OrderFlightTicketType } from 'src/app/order/models/OrderFlightTicketType';
export enum PassengerType {
  /// <summary>
  /// 成人
  /// </summary>
  Adult = 1,
  /// <summary>
  /// 儿童
  /// </summary>
  Children = 2,
  /// <summary>
  /// 婴儿
  /// </summary>
  Baby = 3,
  /// <summary>
  /// 学生
  /// </summary>
  Student = 4,
  /// <summary>
  /// 儿童
  /// </summary>
  Soldier = 5,
}
export class PassengerDto {
  FlightRoutes: FlightRouteEntity[]; // 国际票
  FlightSegments: FlightSegmentEntity[]; // 国际票
  PassengerType: PassengerType;
  /// <summary>
  /// 证件
  /// </summary>
  Credentials: CredentialsEntity;
  /// <summary>
  /// 政策
  /// </summary>
  Policy: PolicyEntity;
  /// <summary>
  /// 员工信息
  /// </summary>
  Staff: StaffEntity;

  /// <summary>
  /// 信用卡
  /// </summary>
  OrderCard: OrderCardEntity;

  /// <summary>
  /// 舱位
  /// </summary>
  FlightCabin: FlightCabinEntity;
  FlightFare: FlightFareEntity;
  /// <summary>
  /// 航班
  /// </summary>
  FlightSegment: FlightSegmentEntity;

  /// <summary>
  /// 票编号
  /// </summary>
  TicketNum: string;
  /// <summary>
  /// 消息类型
  /// </summary>
  MessageLang: string;

  IsApi: boolean;

  /// <summary>
  /// 火车票
  /// </summary>
  Train: TrainEntity;

  /// <summary>
  /// 酒店
  /// </summary>
  RoomPlan: RoomPlanEntity;

  CheckinTime: string;

  GuaranteeAmount: string;

  PenaltyAmount: string;

  LastCancelTime: string;

  FreeCancelTime: string;

  CustomerName: string;
  ChildrenName: string;

  AdditionKey: string;
  /// <summary>
  /// 酒店
  /// </summary>
  InsuranceProducts: InsuranceProductEntity[];

  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterCode: string;
  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenterName: string;
  /// <summary>
  /// 组织名称
  /// </summary>
  OrganizationName: string;
  /// <summary>
  /// 组织代码
  /// </summary>
  OrganizationCode: string;
  /// <summary>
  /// 违反差旅政策内容
  /// </summary>
  IllegalPolicy: string;
  /// <summary>
  /// 违反差旅政策原因
  /// </summary>
  IllegalReason: string;
  ExpenseType: string;
  /// <summary>
  /// 提醒
  /// </summary>
  Tips: string;
  /// <summary>
  /// 出差类型
  /// </summary>
  TravelType: OrderTravelType;
  /// <summary>
  /// 出差支付类型
  /// </summary>
  TravelPayType: OrderTravelPayType;
  /// <summary>
  ///
  /// </summary>
  Mobile: string;
  /// <summary>
  /// 邮箱
  /// </summary>
  Email: string;
  /// <summary>
  /// 卡名
  /// </summary>
  CardName: string;
  /// <summary>
  /// 卡号
  /// </summary>
  CardNumber: string;
  /// <summary>
  /// 外部编号
  /// </summary>
  OutNumbers: { [key: string]: string };

  /// <summary>
  /// 审批人
  /// </summary>
  ApprovalId: string;
  ClientId: string;
  /// <summary>
  ///
  /// </summary>
  IsSkipApprove: boolean;
  OrderHotelType: OrderHotelType;
  OrderFlightTicketType: OrderFlightTicketType;
}
