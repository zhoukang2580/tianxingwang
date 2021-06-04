export class FlightQueryEntity {
  /// <summary>
  /// 开始日期
  /// </summary>
  Date: string;
  /// <summary>
  /// 出发地
  /// </summary>
  FromAirport: string;
  /// <summary>
  /// 到达地
  /// </summary>
  ToAirport: string;
  /// <summary>
  /// 航班(获取详情时有效)
  /// </summary>
  FlightNumber: string;
  /// <summary>
  /// 表单
  /// 需要退改签 NeedIbeRule Y
  /// 只要最低价 LowestOnly Y
  /// 按机场查询 FromAsAirport    Y
  /// 按机场查询 ToAsAirport    Y
  /// 指定Tmc   TmcId   long
  /// </summary>
  Forms: { [key: string]: string };
  /// <summary>
  /// 代理账户编号
  /// </summary>
  AgentId: string;
  /// <summary>
  /// 接收缓存数据
  /// </summary>
  IsCache: boolean;
  /// <summary>
  /// 唯一标识当前对象实例的key
  /// </summary>
  UniqueKey: string;

  /// <summary>
  /// 指定的Tmc
  /// </summary>
  TmcId: string;
  /// <summary>
  /// 按机场查
  /// </summary>
  FromAsAirport: boolean;

  ToAsAirport: boolean;

  /// <summary>
  /// 只要最低价
  /// </summary>
  LowestOnly: boolean;

  /// <summary>
  /// 需要退改签
  /// </summary>
  NeedIbeRule: boolean;

  //  #region 国际*港澳台机票

  Airline: string;
  AccountCode: string;

  /// <summary>
  /// 航班(获取详情时有效)
  /// </summary>
  InternationalFlightNumbers: string;

  /// <summary>
  /// 成人
  /// </summary>
  ADTPtcs: number;
  /// <summary>
  /// 婴儿
  /// </summary>
  INFPtcs: number;
  /// <summary>
  /// 儿童
  /// </summary>
  CNNPtcs: number;
  /// <summary>
  /// 最长等待时间
  /// </summary>
  MaxWaitingTime: number;
  IsAllCabin: boolean;
  FromAirports: string[];
  ToAirports: string[];
  Dates: string[];

  FlightCabins: string[];
  /// <summary>
  /// 唯一标识当前对象实例的key
  /// </summary>
  InternationalUniqueKey: string;
  // 国际机票 end ===============
}
