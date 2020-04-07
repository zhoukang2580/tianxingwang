export class FlightStopCityEntity {
    /// <summary>
    /// 经停机场代码
    /// </summary>
    AirportCode: string;// 
    /// <summary>
    /// 经停机场名称
    /// </summary>
    AirportName: string;// 
    /// <summary>
    /// 经停城市名称
    /// </summary>
    CityName: string;// 
    /// <summary>
    /// 到达时间（先）
    /// </summary>
    ArriveTime: string;// 
    /// <summary>
    /// 起飞时间（后）
    /// </summary>
    TakeoffTime: string;// 
    /// <summary>
    /// 获得经停时间
    /// 2h30m
    /// </summary>
    /// <returns></returns>
    StayTime: string;
}