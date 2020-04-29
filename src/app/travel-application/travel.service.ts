import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { CostCenterEntity, StaffEntity } from "../hr/staff.service";
import { CityEntity } from "../tmc/models/CityEntity";
import { HistoryEntity } from "../order/models/HistoryEntity";
import { TmcEntity } from "../tmc/tmc.service";
import { RequestEntity } from "../services/api/Request.entity";
import { BaseEntity } from "../models/BaseEntity";

@Injectable({
  providedIn: "root",
})
export class TravelService {
  constructor(private apiService: ApiService) {}
  getlist(dto: SearchModel) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-List`;
    req.Data = {
      ...dto,
    };
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getTravelDetail() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Detail`;
    req.Data = {};
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  getTravelSave() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Save`;
    req.Data = {};
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  travelSubmit() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Submit`;
    req.Data = {};
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
  travelCancel() {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = `TmcApiTravelUrl-Home-Cancel`;
    req.Data = {};
    return this.apiService.getResponse<TravelFormEntity[]>(req);
  }
}
export class SearchModel {
  /// <summary>
  /// 差旅单
  /// </summary>

  /// <summary>
  /// 城市
  /// </summary>
  Cities: CityEntity[];

  /// <summary>
  /// 成本中心
  /// </summary>
  CostCenters: CostCenterEntity[];

  /// <summary>
  /// 人员
  /// </summary>
  Staff: StaffEntity;

  /// <summary>
  /// 人员
  /// </summary>
  Staffs: StaffEntity[];

  Tmc: TmcEntity;

  /// <summary>
  /// 审批历史记录
  /// </summary>
  Histories: HistoryEntity[];
  TravelForm: TravelFormEntity;
  // 参数

  OrganizationId: string;
  TravelFormId: string;

  SearchContent: string;
  StatusType: ApprovalStatusType;
  PageIndex: number;
  PageSize: number;

  AccountId: string;

  Trips: TravelFormTripEntity[];
}
export class TravelFormTripEntity extends BaseEntity {
  Tmc: TmcEntity; //
  TravelForm: TravelFormEntity; //

  /// <summary>
  /// 行程内容
  /// </summary>
  Content: string; //

  /// <summary>
  /// 出行工具
  /// </summary>
  TravelTool: string; //

  /// <summary>
  /// 单程往返
  /// </summary>
  IsBackway: boolean; //

  /// <summary>
  /// 出发城市Code
  /// </summary>
  FromCityCode: string; //

  /// <summary>
  /// 出发城市名称
  /// </summary>
  FromCityName: string; //

  /// <summary>
  /// 到达城市Code
  /// </summary>
  ToCityCode: string; //

  /// <summary>
  /// 到达城市名称
  /// </summary>
  ToCityName: string; //

  /// <summary>
  /// 出发机场Code
  /// </summary>
  FromAirportCity: string; //

  /// <summary>
  /// 到达机场Code
  /// </summary>
  ToAirportCity: string; //

  /// <summary>
  /// 出发火车站Code
  /// </summary>
  FromStationCity: string; //

  /// <summary>
  /// 到达火车站Code
  /// </summary>
  ToStationCity: string; //

  /// <summary>
  /// 开始时间
  /// </summary>
  StartDate: string; //

  /// <summary>
  /// 结束时间
  /// </summary>
  EndDate: string; //

  /// <summary>
  /// 时长
  /// </summary>
  Day: number; //
}
export enum ApprovalStatusType {
  /// <summary>
  /// 通过
  /// </summary>
  Pass = 1,
  /// <summary>
  /// 拒绝
  /// </summary>
  Refuse = 2,
  /// <summary>
  /// 待审核
  /// </summary>
  Waiting = 3,

  /// <summary>
  /// 待提交
  /// </summary>
  WaiteSubmit = 4,
}
export interface TravelFormEntity {
  Id: string;
  TravelNumber: string;
  Number: string;
  ApplyTime: string;
  ApprovalTime: string;
  StatusType: ApprovalStatusType;
}
