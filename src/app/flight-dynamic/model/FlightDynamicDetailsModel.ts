export class FlightDynamicDetailPage {

    /// <summary>
    /// 航班号
    /// </summary>
    FlightNumber: string
    /// <summary>
    /// 航班日期
    /// </summary>
    Date: string

    /// <summary>
    /// 出发地
    /// </summary>
    FromAirport: string
    FromAirportName: string

    EstimateTakeoffTime:string
    EstimateArrivalTime:string

    /// <summary>
    /// 到达地
    /// </summary>
    ToAirport: string
    ToAirportName: string

    CkiCounter:string

    /// <summary>
    /// 备用到达机场
    /// </summary>
    SpareToAirport: string

    /// <summary>
    /// 实际到达机场
    /// </summary>
    RealToAirport: string

    /// <summary>
    /// 始发航站楼
    /// </summary>
    FromTerminal: string

    /// <summary>
    /// 到达航站楼
    /// </summary>
    ToTerminal: string

    /// <summary>
    /// 计划起飞时间
    /// </summary>
    PlanTakeoffTime: string

    /// <summary>
    /// 计划到达时间
    /// </summary>
    PlanArrivalTime: string

    /// <summary>
    /// 实际起飞时间
    /// </summary>
    RealTakeoffTime: string

    /// <summary>
    /// 实际到达时间
    /// </summary>
    RealArrivalTime: string

    /// <summary>
    /// 取消时间
    /// </summary>
    CancelTime: string

    Minute:string

    /// <summary>
    /// 前序航班
    /// </summary>
    PreviousFlightNumber: string
    /// <summary>
    /// 前序航班日期
    /// </summary>
    PreviousFlightDate: string

    /// <summary>
    /// 前序航班
    /// </summary>
    PreviousFromAirport: string
    /// <summary>
    /// 前序航班日期
    /// </summary>
    PreviousToAirport: string
    /// <summary>
    /// 出发准点率
    /// </summary>
    TakeoffOntimeRate: string

    /// <summary>
    /// 登机口
    /// </summary>
    BoardingGate: string

    /// <summary>
    /// 行李转盘
    /// </summary>
    Carousel: string

    /// <summary>
    /// 航班号
    /// </summary>
    FlightDynamicStatusType: string
    StatusName: string
    AddDay: string
}