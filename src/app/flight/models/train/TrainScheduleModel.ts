export class TrainScheduleModel {
  ArriveDays: number; //  Yes 列车从出发站到达目的站的运行天数
  StationNo: string; //  Yes 参考官方站点顺序从 1 开始编排
  StationName: string; //  Yes 车站名
  ArriveTime: string; //  Yes 到站时刻,如： “07:16”
  StartTime: string; //  Yes 离站时刻
  StayTime: string; //  Yes 停留时间
}
