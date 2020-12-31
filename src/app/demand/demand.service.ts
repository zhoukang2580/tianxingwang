import { Injectable } from '@angular/core';
import { ApiService } from '../services/api/api.service';
import { RequestEntity } from '../services/api/Request.entity';

@Injectable({
  providedIn: 'root'
})
export class DemandService {

  constructor(
    private apiService: ApiService,
  ) { }

  getDemandTeam(d: { Tag: String, DemandType: String }) {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-SaveDemand"
    req.Data = {
      DemandType: d.DemandType,
      Tag: d.Tag
    };
    return this.apiService.getPromiseData<any[]>(req);
  }
}
export enum FlightType {
  /// <summary>
  /// 需求单
  /// </summary>
  //  [Description("需求单")]
  FlightDemand = 1,
  /// <summary>
  /// 国际机票改签
  /// </summary>
  //  [Description("国际机票改签")]
  InternationFlightExchange = 2,
  /// <summary>
  /// 国际机票退票
  /// </summary>
  //  [Description("国际机票退票")]
  InternationalFlightRefund = 3,
  /// <summary>
  /// 国际机票出票
  /// </summary>
  //  [Description("国际机票出票")]
  InternationFlightIssue = 4,
  /// <summary>
  /// 国际机票出票
  /// </summary>
  //  [Description("国际机票改签出票")]
  InternationFlightExchangeIssue = 5,
  /// <summary>
  /// 国内机票改签
  /// </summary>
  //  [Description("国内机票改签")]
  FlightExchange = 6,
  /// <summary>
  /// 国内机票退票
  /// </summary>
  //  [Description("国内机票退票")]
  FlightRefund = 7,
  /// <summary>
  /// 团队需求单
  /// </summary>
  //  [Description("团队需求单")]
  TeamDemand = 8,
  /// <summary>
  /// 旅游需求单
  /// </summary>
  //  [Description("旅游需求单")]
  TourDemand = 9,
  /// <summary>
  /// 签证需求单
  /// </summary>
  //  [Description("签证需求单")]
  VisaDemand = 10,
  /// <summary>
  /// 用车需求单
  /// </summary>
  //  [Description("用车需求单")]
  CarDemand = 11,
  /// <summary>
  /// 机场服务需求单
  /// </summary>
  //  [Description("机场服务需求单")]
  AirportDemand = 12
}