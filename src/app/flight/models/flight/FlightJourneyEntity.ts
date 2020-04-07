import { FlightRouteEntity } from './FlightRouteEntity';

export class FlightJourneyEntity {
    /// <summary>
    /// 旅行日期
    /// </summary>
    Date: string;

    /// <summary>
    /// 星期
    /// </summary>
    Week: string;

    /// <summary>
    /// 出发城市
    /// </summary>
    FromCity: string;
    /// <summary>
    /// 到达城市
    /// </summary>
    ToCity: string;
    /// <summary>
    /// 航段信息
    /// </summary>
    FlightRoutes: FlightRouteEntity[];
}