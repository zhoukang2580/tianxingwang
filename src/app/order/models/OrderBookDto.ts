import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { AgentEntity } from "src/app/tmc/models/AgentEntity";
import { OrderEntity } from "./OrderEntity";
import { CityEntity } from "src/app/tmc/models/CityEntity";
import { OrderLinkmanDto } from "./OrderLinkmanDto";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { OrderExpressDto } from "./OrderExpressDto";
import { AgentDataEntity } from "src/app/tmc/models/AgentDataEntity";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { ErrorInfo } from "src/app/models/ErrorInfo";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";

export class OrderBookDto {
  /// <summary>
  /// 订单来源Identity
  /// </summary>
  Channel: string;
  TravelFormId: string;
  /// <summary>
  /// 订单类型
  /// </summary>
  OrderType: string;
  /// <summary>
  /// 联系人
  /// </summary>
  Cities: CityEntity[];
  /// <summary>
  /// 联系人
  /// </summary>
  Linkmans: OrderLinkmanDto[];
  /// <summary>
  /// 旅客信息
  /// </summary>
  Passengers: PassengerDto[];

  OrderExpress: OrderExpressDto;

  AgentData: AgentDataEntity;

  IsForbidAutoBook: boolean;

  IsForbidAutoIssue: boolean;
  /// <summary>
  /// 线下
  /// </summary>
  IsFromOffline: boolean;
  /// <summary>
  /// 通知
  /// </summary>
  NotifyUrl: string;
  /// <summary>
  /// 通知
  /// </summary>
  Token: string;
  /// <summary>
  /// 通知
  /// </summary>
  Key: string;
  /// <summary>
  /// 预订
  /// </summary>
  TicketId: string;
  /// <summary>
  /// 预订
  /// </summary>
  BookerId: string;
  /// <summary>
  /// 客户编号
  /// </summary>
  TmcId: string;
  /// <summary>
  /// 客户编号
  /// </summary>
  AgentId: string;
  /// <summary>
  ///
  /// </summary>
  ServiceFee: string;
  /// <summary>
  ///
  /// </summary>
  ServiceFeeTag: string;

  /// <summary>
  /// 标示
  /// </summary>
  Identity: IdentityEntity;

  /// <summary>
  /// 预订
  /// </summary>
  Booker: AccountEntity;
  /// <summary>
  ///
  /// </summary>
  Tmc: TmcEntity;

  Agent: AgentEntity;

  Orders: OrderEntity[];

  Errors: ErrorInfo[];
  IsSaveSuccess: boolean;
  SelfPayAmount: string;
}
