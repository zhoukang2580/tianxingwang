export class TrainScheduleEntity {
  /// <summary>
  /// 列车从出发站到达目的站的运行天数
  /// 0：当日到达，
  /// 1：次日到达，
  /// 2：三日到达，
  /// 3：四日到达，依此类推
  /// </summary>
  ArriveDays: number;
  /// <summary>
  /// 参考官方站点顺序从 1 开始编排
  /// </summary>
  StationNo: string;
  /// <summary>
  /// 车站名
  /// </summary>
  StationName: string;
  /// <summary>
  /// 到站时刻,如： “07:16”
  /// </summary>
  ArriveTime: string;
  /// <summary>
  /// 离站时刻
  /// </summary>
  StartTime: string;
  /// <summary>
  /// 经停时间
  /// </summary>
  StayTime: string;
}
