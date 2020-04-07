import { AgentEntity } from '../../../tmc/models/AgentEntity';
import { FlightMatchDateArrayEntity } from './FlightMatchDateArrayEntity';
import { FlightMatchRouteEntity } from './FlightMatchRouteEntity';

export class FlightPolicyEntity {
    /// <summary>
    /// 代理
    /// </summary>
    Agent: AgentEntity;// 
    /// <summary>
    /// 名称
    /// </summary>
    Name: string;// 

    /// <summary>
    /// 航公公司
    /// </summary>
    Airline: string;// 
    OrderTravelPays: string;

    OrderTravelPayNames: string;
    /// <summary>
    /// 规则管理
    /// </summary>
    Route: string;// 

    /// <summary>
    /// 不启用
    /// </summary>
    UnRoute: string;// 

    /// <summary>
    /// 航班
    /// </summary>
    Flights: string;// 

    /// <summary>
    /// 禁止航班
    /// </summary>
    UnFlights: string;// 

    /// <summary>
    /// 舱位
    /// </summary>
    Cabins: string;// 

    /// <summary>
    /// 起飞时段
    /// </summary>
    FlightDate: string;// 

    /// <summary>
    /// 禁止时段
    /// </summary>
    UnFlightDate: string;// 

    /// <summary>
    /// 禁止时段
    /// </summary>
    IssueStartDate: string;// 

    /// <summary>
    /// 禁止时段
    /// </summary>
    IssueEndDate: string;// 

    /// <summary>
    /// 开始时间
    /// </summary>
    StartDate: string;// 

    /// <summary>
    /// 结束时间
    /// </summary>
    EndDate: string;// 

    /// <summary>
    /// 获得返利
    /// </summary>
    GainRate: string;// 

    /// <summary>
    /// 返给客户返利
    /// </summary>
    PayRate: string;// 

    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsed: boolean;// 
    /// <summary>
    /// 是否强制执行
    /// </summary>
    IsForced: boolean;// 
    /// <summary>
    /// 是否启用
    /// </summary>
    IsUsedName: string;
    /// <summary>
    /// 航班日期
    /// </summary>
    FlightDateArray: FlightMatchDateArrayEntity[];



    /// <summary>
    /// 航班日期
    /// </summary>
    UnFlightDateArray: FlightMatchDateArrayEntity[];



    /// <summary>
    /// 航班
    /// </summary>
    FlightArray: string[];


    /// <summary>
    /// 航班
    /// </summary>
    UnFlightArray: string[];


    /// <summary>
    /// 舱位
    /// </summary>
    CabinArray: string[];



    /// <summary>
    /// 规则
    /// </summary>
    RouteArray: FlightMatchRouteEntity[];



    /// <summary>
    /// 规则
    /// </summary>
    UnRouteArray: FlightMatchRouteEntity[];



}