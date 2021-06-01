import { InsuranceResultEntity } from './../../tmc/models/Insurance/InsuranceResultEntity';
import { CredentialsEntity } from 'src/app/tmc/models/CredentialsEntity';
import { TravelFormEntity, TmcEntity } from 'src/app/tmc/tmc.service';
import { PassengerDto } from 'src/app/tmc/models/PassengerDto';
import { AgentEntity } from 'src/app/tmc/models/AgentEntity';
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { StaffEntity, StaffBookType } from 'src/app/hr/hr.service';
import { OrderTrainTicketEntity } from './OrderTrainTicketEntity';
import { TrafficlineEntity } from 'src/app/tmc/models/TrafficlineEntity';

export class ExchangeTrainModel {
    TravelForm: TravelFormEntity;
    Action: string;
    /// <summary>
    /// 去程日期
    /// </summary>
    GoDate: string;
    /// <summary>
    /// 回城日期
    /// </summary>
    BackDate: string;
    /// <summary>
    /// 出发机场
    /// </summary>
    FromStation: string;
    /// <summary>
    /// 到达机场
    /// </summary>
    ToStation: string;
    /// <summary>
    /// 出发机场
    /// </summary>
    FromStationName: string;
    /// <summary>
    /// 到达机场
    /// </summary>
    ToStationName: string;
    /// <summary>
    /// 航班
    /// </summary>
    TrainNumber: string;
    /// <summary>
    /// 预订信息
    /// </summary>
    Book: string;
    /// <summary>
    /// 是否回城
    /// </summary>
    IsBack: boolean;
    IsRangeExchange: boolean;
    RangeExchangeDateTip: string;
    /// <summary>
    /// 乘客
    /// </summary>
    PassengerValue: string;
    /// <summary>
    /// 乘客
    /// </summary>
    Passengers: PassengerDto[];
    /// <summary>
    /// 类型
    /// </summary>
    VoyageType: any;
    /// <summary>
    /// 航班返回结果
    /// </summary>
    TrainResult: any;
    /// <summary>
    /// TmcData
    /// </summary>
    TmcData: any;
    /// <summary>
    /// 代理
    /// </summary>
    Agent: AgentEntity;
    /// <summary>
    /// 当前身份
    /// </summary>
    Identity: IdentityEntity;
    /// <summary>
    /// 当前身份
    /// </summary>
    Tmc: TmcEntity;
    /// <summary>
    /// 当前员工
    /// </summary>
    BookStaff: StaffEntity;
    /// <summary>
    /// 改签车票信息
    /// </summary>
    OrderTrainTicket: OrderTrainTicketEntity;
    /// <summary>
    /// 证件
    /// </summary>
    DefaultCredentials: CredentialsEntity;
    /// <summary>
    /// 是否代理
    /// </summary>
    IsAgent: boolean;

    TravelFormId: string;
    /// <summary>
    /// 火车站
    /// </summary>
    Trafficlines: TrafficlineEntity[];
    IsAllowModify: boolean;
    IsExchange: boolean;
    StaffBookType: StaffBookType;
    InsurnanceAmount: number;
}