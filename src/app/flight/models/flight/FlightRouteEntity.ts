import { FlightSegmentEntity } from './FlightSegmentEntity';

export class FlightRouteEntity {
    /// <summary>
    /// 首航班起飞时间
    /// </summary>
    FirstTime: string;
    /// <summary>
    /// 航班信息
    /// </summary>
    FlightSegments: FlightSegmentEntity[];
}